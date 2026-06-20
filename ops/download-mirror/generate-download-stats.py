#!/usr/bin/env python3
"""Aggregate Walnut download mirror logs into a public stats.json file.

The website is a static export, so geo analytics are produced at the download
mirror/CDN edge and published as JSON. This script intentionally emits only
aggregates: no IPs, user agents, or request identifiers leave the server.

The public output keeps the human-facing country leaderboard separate from the
authoritative totals. Requests that cannot be mapped to a country are exposed in
``unattributed`` instead of being silently dropped from the detail view.
"""

from __future__ import annotations

import argparse
import gzip
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote, urlparse

SCHEMA_VERSION = 2
DOWNLOAD_SUFFIXES = (
    ".dmg",
    ".exe",
    ".msi",
    ".appimage",
    ".deb",
    ".rpm",
    ".tar.gz",
    ".zip",
)
EXCLUDED_NAMES = {"latest.json", "downloads.json", "checksums.txt", "stats.json"}
EXCLUDED_SUFFIXES = (".sig", ".json", ".txt")
SUCCESS_STATUSES = {200, 206}
DEFAULT_COUNTRY = "Unknown"
DEFAULT_PATH_PREFIXES = ("/downloads/versions/", "/downloads/latest/")
DEFAULT_ASSET_ROOT = Path("/var/www/walnut/downloads")
SESSION_GAP_SECONDS = 30 * 60
COMPLETION_RATIO = 0.9
MAX_TRACKED_FILES = 128
MAX_TRACKED_SESSIONS = 4096

COMBINED_LOG_RE = re.compile(
    r'^\S+ \S+ \S+ \[[^\]]+\] "(?P<method>[A-Z]+) (?P<target>[^" ]+)(?: HTTP/[0-9.]+)?" '
    r'(?P<status>\d{3}) (?P<body_bytes_sent>\d+|-)'  # default nginx combined format
)

COUNTRY_FIELDS = (
    "country",
    "country_code",
    "cf_country",
    "vercel_country",
    "x_country",
    "x_geo_country",
    "cloudfront_country",
)
REGION_FIELDS = (
    "region",
    "region_code",
    "vercel_region",
    "x_region",
    "x_geo_region",
)
BYTE_FIELDS = ("bytes_sent", "body_bytes_sent", "bytes", "total_bytes")


def safe_int(value: Any, default: int = 0) -> int:
    if isinstance(value, int) and value >= 0:
        return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    return default


def clean_geo_value(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip()
    if not cleaned or cleaned in {"-", "--", "XX", "unknown", "Unknown"}:
        return None
    return cleaned


def normalize_country(value: Any) -> tuple[str | None, str] | None:
    cleaned = clean_geo_value(value)
    if not cleaned:
        return None
    if re.fullmatch(r"[A-Za-z]{2}", cleaned):
        code = cleaned.upper()
        return code, code
    return None, cleaned


def normalize_region(value: Any) -> tuple[str | None, str] | None:
    cleaned = clean_geo_value(value)
    if not cleaned:
        return None
    if re.fullmatch(r"[A-Za-z0-9_-]{1,10}", cleaned):
        return cleaned.upper(), cleaned.upper()
    return None, cleaned


def first_geo(record: dict[str, Any], fields: Iterable[str], region: bool = False):
    for field in fields:
        normalizer = normalize_region if region else normalize_country
        parsed = normalizer(record.get(field))
        if parsed:
            return parsed
    return None


def extract_request_target(record: dict[str, Any]) -> str | None:
    for key in ("uri", "request_uri", "target", "path"):
        value = record.get(key)
        if isinstance(value, str) and value:
            return value
    request = record.get("request")
    if isinstance(request, str):
        parts = request.split()
        if len(parts) >= 2:
            return parts[1]
    return None


def is_download_path(target: str, path_prefixes: tuple[str, ...]) -> bool:
    path = unquote(urlparse(target).path)
    if not any(path.startswith(prefix) for prefix in path_prefixes):
        return False

    asset_name = Path(path).name.lower()
    if not asset_name or asset_name in EXCLUDED_NAMES:
        return False
    if asset_name.endswith(EXCLUDED_SUFFIXES):
        return False
    return asset_name.endswith(DOWNLOAD_SUFFIXES)


def download_asset_from_target(target: str) -> tuple[str, str]:
    path = unquote(urlparse(target).path)
    return path, Path(path).name


def read_event_timestamp(record: dict[str, Any]) -> int:
    value = record.get("time")
    if isinstance(value, str) and value:
        normalized = value.replace("Z", "+00:00")
        try:
            return int(datetime.fromisoformat(normalized).timestamp())
        except ValueError:
            pass
    return int(datetime.now(timezone.utc).timestamp())


def read_remote_addr(record: dict[str, Any]) -> str:
    value = record.get("remote_addr")
    return value.strip() if isinstance(value, str) and value.strip() else "unknown"


def resolve_asset_size(asset_root: Path | None, asset_path: str) -> int:
    if not asset_root:
        return 0
    if not asset_path.startswith("/downloads/"):
        return 0

    root = asset_root.resolve()
    relative_path = asset_path.removeprefix("/downloads/").lstrip("/")
    candidate = (root / relative_path).resolve()
    if candidate != root and root not in candidate.parents:
        return 0
    try:
        stat = candidate.stat()
    except OSError:
        return 0
    return stat.st_size if candidate.is_file() else 0


def parse_json_line(line: str) -> dict[str, Any] | None:
    try:
        value = json.loads(line)
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def parse_combined_line(line: str) -> dict[str, Any] | None:
    match = COMBINED_LOG_RE.match(line)
    if not match:
        return None
    body_bytes_sent = match.group("body_bytes_sent")
    return {
        "method": match.group("method"),
        "uri": match.group("target"),
        "status": int(match.group("status")),
        "body_bytes_sent": 0 if body_bytes_sent == "-" else int(body_bytes_sent),
    }


def parse_log_line(line: str) -> dict[str, Any] | None:
    stripped = line.strip()
    if not stripped:
        return None
    return parse_json_line(stripped) or parse_combined_line(stripped)


def iter_log_paths(paths: Iterable[Path]) -> Iterable[Path]:
    for path in paths:
        if any(char in str(path) for char in "*?["):
            yield from sorted(path.parent.glob(path.name))
        elif path.exists():
            yield path


def read_bytes_sent(record: dict[str, Any]) -> int:
    for field in BYTE_FIELDS:
        value = record.get(field)
        parsed = safe_int(value, -1)
        if parsed >= 0:
            return parsed
    return 0


def empty_state() -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "total_requests": 0,
        "partial_requests": 0,
        "completed_downloads": 0,
        "total_bytes": 0,
        "countries": {},
        "assets": {},
        "files": {},
        "sessions": {},
    }


def load_state(state_path: Path | None) -> dict[str, Any]:
    if not state_path or not state_path.exists():
        return empty_state()
    try:
        state = json.loads(state_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return empty_state()
    if not isinstance(state, dict):
        return empty_state()
    if safe_int(state.get("schema_version")) != SCHEMA_VERSION:
        return empty_state()
    state.setdefault("total_requests", 0)
    state.setdefault("partial_requests", 0)
    state.setdefault("completed_downloads", 0)
    state.setdefault("total_bytes", 0)
    state.setdefault("countries", {})
    state.setdefault("assets", {})
    state.setdefault("files", {})
    state.setdefault("sessions", {})
    if (
        not isinstance(state["countries"], dict)
        or not isinstance(state["assets"], dict)
        or not isinstance(state["files"], dict)
        or not isinstance(state["sessions"], dict)
    ):
        return empty_state()
    return state


def write_json_atomic(output_path: Path, data: dict[str, Any]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_name(f".{output_path.name}.tmp")
    temp_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp_path.replace(output_path)


def write_state(state_path: Path, state: dict[str, Any]) -> None:
    files = state.get("files", {})
    if isinstance(files, dict) and len(files) > MAX_TRACKED_FILES:
        kept = sorted(
            files.items(),
            key=lambda item: safe_int(item[1].get("updated_at"), 0)
            if isinstance(item[1], dict)
            else 0,
            reverse=True,
        )[:MAX_TRACKED_FILES]
        state["files"] = dict(kept)
    sessions = state.get("sessions", {})
    if isinstance(sessions, dict) and len(sessions) > MAX_TRACKED_SESSIONS:
        kept_sessions = sorted(
            sessions.items(),
            key=lambda item: safe_int(item[1].get("last_seen"), 0)
            if isinstance(item[1], dict)
            else 0,
            reverse=True,
        )[:MAX_TRACKED_SESSIONS]
        state["sessions"] = dict(kept_sessions)
    write_json_atomic(state_path, state)


def file_id(path: Path) -> str:
    stat = path.stat()
    return f"{stat.st_dev}:{stat.st_ino}"


def read_new_lines(path: Path, state: dict[str, Any]) -> Iterable[str]:
    stat = path.stat()
    identity = file_id(path)
    files = state.setdefault("files", {})
    previous = files.get(identity, {}) if isinstance(files.get(identity), dict) else {}

    if path.suffix == ".gz":
        if previous.get("complete"):
            return
        with gzip.open(path, "rt", encoding="utf-8", errors="replace") as file:
            for line in file:
                yield line
        files[identity] = {
            "path": str(path),
            "offset": stat.st_size,
            "complete": True,
            "updated_at": int(datetime.now(timezone.utc).timestamp()),
        }
        return

    offset = safe_int(previous.get("offset"), 0)
    if offset > stat.st_size:
        offset = 0

    with path.open("rb") as file:
        file.seek(offset)
        for raw_line in file:
            yield raw_line.decode("utf-8", errors="replace")
        files[identity] = {
            "path": str(path),
            "offset": file.tell(),
            "complete": False,
            "updated_at": int(datetime.now(timezone.utc).timestamp()),
        }


def mark_completed_download(
    state: dict[str, Any],
    country_bucket: dict[str, Any],
    region_bucket: dict[str, Any] | None,
    asset_bucket: dict[str, Any],
) -> None:
    state["completed_downloads"] = safe_int(state.get("completed_downloads")) + 1
    country_bucket["downloads"] = safe_int(country_bucket.get("downloads")) + 1
    asset_bucket["downloads"] = safe_int(asset_bucket.get("downloads")) + 1
    if region_bucket:
        region_bucket["downloads"] = safe_int(region_bucket.get("downloads")) + 1


def session_reached_completion(
    state: dict[str, Any],
    *,
    remote_addr: str,
    asset_path: str,
    timestamp: int,
    bytes_sent: int,
    asset_size: int,
) -> bool:
    if asset_size <= 0 or bytes_sent <= 0:
        return False

    threshold = max(1, int(asset_size * COMPLETION_RATIO))
    session_key = f"{remote_addr}|{asset_path}"
    sessions = state.setdefault("sessions", {})
    existing = sessions.get(session_key)
    session = existing if isinstance(existing, dict) else None

    if session:
        last_seen = safe_int(session.get("last_seen"), timestamp)
        if timestamp - last_seen > SESSION_GAP_SECONDS:
            session = None

    if not session:
        session = {
            "remote_addr": remote_addr,
            "asset_path": asset_path,
            "bytes": 0,
            "last_seen": timestamp,
            "completed": False,
        }
        sessions[session_key] = session

    session["bytes"] = safe_int(session.get("bytes")) + bytes_sent
    session["last_seen"] = timestamp
    if not session.get("completed") and safe_int(session.get("bytes")) >= threshold:
        session["completed"] = True
        return True
    return False


def add_download(
    state: dict[str, Any],
    record: dict[str, Any],
    target: str,
    *,
    asset_root: Path | None,
) -> None:
    bytes_sent = read_bytes_sent(record)
    status = safe_int(record.get("status"), 0)
    is_partial = status == 206
    timestamp = read_event_timestamp(record)
    remote_addr = read_remote_addr(record)
    asset_path, asset_name = download_asset_from_target(target)
    asset_size = resolve_asset_size(asset_root, asset_path)
    country = first_geo(record, COUNTRY_FIELDS)
    country_code, country_name = country if country else (None, DEFAULT_COUNTRY)
    country_key = country_code or country_name
    region = first_geo(record, REGION_FIELDS, region=True)

    countries = state.setdefault("countries", {})
    country_bucket = countries.setdefault(
        country_key,
        {
            "country_code": country_code,
            "country_name": country_name,
            "downloads": 0,
            "requests": 0,
            "partial_requests": 0,
            "bytes": 0,
            "regions": {},
        },
    )
    country_bucket["requests"] = safe_int(country_bucket.get("requests")) + 1
    if is_partial:
        country_bucket["partial_requests"] = safe_int(country_bucket.get("partial_requests")) + 1
    country_bucket["bytes"] = safe_int(country_bucket.get("bytes")) + bytes_sent
    state["total_requests"] = safe_int(state.get("total_requests")) + 1
    if is_partial:
        state["partial_requests"] = safe_int(state.get("partial_requests")) + 1
    state["total_bytes"] = safe_int(state.get("total_bytes")) + bytes_sent

    assets = state.setdefault("assets", {})
    asset_bucket = assets.setdefault(
        asset_path,
        {
            "name": asset_name,
            "path": asset_path,
            "downloads": 0,
            "requests": 0,
            "partial_requests": 0,
            "bytes": 0,
        },
    )
    if asset_size:
        asset_bucket["size"] = asset_size
    asset_bucket["requests"] = safe_int(asset_bucket.get("requests")) + 1
    if is_partial:
        asset_bucket["partial_requests"] = safe_int(asset_bucket.get("partial_requests")) + 1
    asset_bucket["bytes"] = safe_int(asset_bucket.get("bytes")) + bytes_sent

    region_bucket: dict[str, Any] | None = None
    if region:
        region_code, region_name = region
        region_key = region_code or region_name
        regions = country_bucket.setdefault("regions", {})
        region_bucket = regions.setdefault(
            region_key,
            {
                "region_code": region_code,
                "region_name": region_name,
                "downloads": 0,
                "requests": 0,
                "partial_requests": 0,
                "bytes": 0,
            },
        )
        region_bucket["requests"] = safe_int(region_bucket.get("requests")) + 1
        if is_partial:
            region_bucket["partial_requests"] = safe_int(region_bucket.get("partial_requests")) + 1
        region_bucket["bytes"] = safe_int(region_bucket.get("bytes")) + bytes_sent

    if session_reached_completion(
        state,
        remote_addr=remote_addr,
        asset_path=asset_path,
        timestamp=timestamp,
        bytes_sent=bytes_sent,
        asset_size=asset_size,
    ):
        mark_completed_download(state, country_bucket, region_bucket, asset_bucket)


def process_logs(
    log_paths: Iterable[Path],
    state: dict[str, Any],
    *,
    path_prefixes: tuple[str, ...],
    asset_root: Path | None,
) -> None:
    for log_path in iter_log_paths(log_paths):
        for line in read_new_lines(log_path, state):
            record = parse_log_line(line)
            if not record:
                continue

            method = str(record.get("method", "")).upper()
            status = safe_int(record.get("status"), 0)
            target = extract_request_target(record)
            if method != "GET" or status not in SUCCESS_STATUSES or not target:
                continue
            if not is_download_path(target, path_prefixes):
                continue

            add_download(state, record, target, asset_root=asset_root)


def public_stats_from_state(
    state: dict[str, Any],
    *,
    top_countries: int = 50,
    top_regions: int = 10,
    top_assets: int = 50,
) -> dict[str, Any]:
    country_rows = []
    unattributed = {
        "downloads": 0,
        "requests": 0,
        "partial_requests": 0,
        "bytes": 0,
    }
    countries = state.get("countries", {})
    if not isinstance(countries, dict):
        countries = {}

    for country in countries.values():
        if not isinstance(country, dict):
            continue
        raw_regions = country.get("regions", {})
        regions = list(raw_regions.values()) if isinstance(raw_regions, dict) else []
        regions = [region for region in regions if isinstance(region, dict)]
        regions.sort(key=lambda item: (-safe_int(item.get("downloads")), str(item.get("region_name", ""))))
        country_code = country.get("country_code")
        country_name = str(country.get("country_name") or DEFAULT_COUNTRY)
        # Unknown keeps global totals accurate, but it is not a country for Top 5.
        if not country_code and country_name == DEFAULT_COUNTRY:
            unattributed["downloads"] += safe_int(country.get("downloads"))
            unattributed["requests"] = safe_int(unattributed.get("requests")) + safe_int(
                country.get("requests")
            )
            unattributed["partial_requests"] = safe_int(
                unattributed.get("partial_requests")
            ) + safe_int(country.get("partial_requests"))
            unattributed["bytes"] += safe_int(country.get("bytes"))
            continue
        country_rows.append(
            {
                "country_code": country_code,
                "country_name": country_name,
                "downloads": safe_int(country.get("downloads")),
                "requests": safe_int(country.get("requests")),
                "partial_requests": safe_int(country.get("partial_requests")),
                "bytes": safe_int(country.get("bytes")),
                "regions": regions[:top_regions],
            }
        )

    country_rows.sort(
        key=lambda item: (-item["downloads"], -item["requests"], item["country_name"])
    )

    asset_rows = []
    assets = state.get("assets", {})
    if not isinstance(assets, dict):
        assets = {}
    for asset in assets.values():
        if not isinstance(asset, dict):
            continue
        path = str(asset.get("path") or "")
        name = str(asset.get("name") or (Path(path).name if path else ""))
        if not name:
            continue
        asset_rows.append(
            {
                "name": name,
                "path": path,
                "downloads": safe_int(asset.get("downloads")),
                "requests": safe_int(asset.get("requests")),
                "partial_requests": safe_int(asset.get("partial_requests")),
                "bytes": safe_int(asset.get("bytes")),
                **(
                    {"size": safe_int(asset.get("size"))}
                    if safe_int(asset.get("size")) > 0
                    else {}
                ),
            }
        )
    asset_rows.sort(key=lambda item: (-item["downloads"], -item["requests"], item["name"]))

    return {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "total_downloads": safe_int(state.get("completed_downloads")),
        "total_requests": safe_int(state.get("total_requests")),
        "partial_requests": safe_int(state.get("partial_requests")),
        "total_bytes": safe_int(state.get("total_bytes")),
        "unattributed": unattributed,
        "countries": country_rows[:top_countries],
        "assets": asset_rows[:top_assets],
    }


def build_stats(
    log_paths: Iterable[Path],
    *,
    path_prefixes: tuple[str, ...] = DEFAULT_PATH_PREFIXES,
    top_countries: int = 50,
    top_regions: int = 10,
    top_assets: int = 50,
    asset_root: Path | None = DEFAULT_ASSET_ROOT,
    state_path: Path | None = None,
) -> dict[str, Any]:
    state = load_state(state_path)
    process_logs(log_paths, state, path_prefixes=path_prefixes, asset_root=asset_root)
    stats = public_stats_from_state(
        state,
        top_countries=top_countries,
        top_regions=top_regions,
        top_assets=top_assets,
    )
    if state_path:
        write_state(state_path, state)
    return stats


def write_stats(output_path: Path, stats: dict[str, Any]) -> None:
    write_json_atomic(output_path, stats)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--log", action="append", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--state", type=Path)
    parser.add_argument("--path-prefix", action="append", dest="path_prefixes")
    parser.add_argument("--top-countries", type=int, default=50)
    parser.add_argument("--top-regions", type=int, default=10)
    parser.add_argument("--top-assets", type=int, default=50)
    parser.add_argument(
        "--asset-root",
        type=Path,
        default=DEFAULT_ASSET_ROOT,
        help="Local mirror root used to resolve asset sizes for completed-download inference.",
    )
    args = parser.parse_args()

    path_prefixes = tuple(args.path_prefixes or DEFAULT_PATH_PREFIXES)
    stats = build_stats(
        args.log,
        path_prefixes=path_prefixes,
        top_countries=max(1, args.top_countries),
        top_regions=max(0, args.top_regions),
        top_assets=max(0, args.top_assets),
        asset_root=args.asset_root,
        state_path=args.state,
    )
    write_stats(args.output, stats)
    print(f"Wrote download stats: {args.output}")


if __name__ == "__main__":
    main()
