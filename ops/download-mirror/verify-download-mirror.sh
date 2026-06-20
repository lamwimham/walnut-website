#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-dl.walnut.evofarm.top}"
BASE_URL="https://${DOMAIN}/downloads"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TEMP_DIR}"' EXIT

echo "Fetching mirror manifests..."
curl -fsS "${BASE_URL}/latest/latest.json" > "${TEMP_DIR}/latest.json"
curl -fsS "${BASE_URL}/latest/downloads.json" > "${TEMP_DIR}/downloads.json"

VERSION="$(
  BASE_URL="${BASE_URL}" python3 - "${TEMP_DIR}/latest.json" "${TEMP_DIR}/downloads.json" <<'PY'
import json
import os
import sys

latest = json.load(open(sys.argv[1], encoding="utf-8"))
downloads = json.load(open(sys.argv[2], encoding="utf-8"))
version = latest["version"]
assert downloads["tag_name"] == f"v{version}", (version, downloads["tag_name"])
assert latest["platforms"], "latest.json has no updater platforms"
assert downloads["assets"], "downloads.json has no mirrored assets"
base_url = os.environ["BASE_URL"].rstrip("/")
version_prefix = f"{base_url}/versions/{version}/"
download_urls = {asset["browser_download_url"] for asset in downloads["assets"]}
for target, entry in latest["platforms"].items():
    assert entry.get("signature"), f"missing updater signature for {target}"
    url = entry["url"]
    assert url.startswith(version_prefix), f"{target} does not use immutable mirror URL: {url}"
    assert url in download_urls, f"{target} updater asset is absent from downloads.json: {url}"
for asset in downloads["assets"]:
    url = asset["browser_download_url"]
    assert url.startswith(version_prefix), f"download asset does not use versioned mirror URL: {url}"
print(version)
PY
)"
echo "Validated mirror manifests for v${VERSION}."

ASSET_URL="$(
  python3 - "${TEMP_DIR}/downloads.json" <<'PY'
import json
import sys

downloads = json.load(open(sys.argv[1], encoding="utf-8"))
for asset in downloads["assets"]:
    if asset["name"].lower().endswith((".dmg", ".exe", ".msi", ".appimage", ".deb", ".rpm")):
        print(asset["browser_download_url"])
        break
else:
    raise SystemExit("No manual installer found in downloads.json")
PY
)"

echo "Checking mutable manifest headers..."
curl -fsSI "${BASE_URL}/latest/latest.json" | grep -i '^cache-control:.*no-cache'

echo "Checking immutable installer headers and byte ranges..."
curl -fsSI "${ASSET_URL}" | grep -i '^cache-control:.*immutable'
curl -fsSI "${ASSET_URL}" | grep -i '^accept-ranges:.*bytes'

echo "Checking public download stats..."
curl -fsS "${BASE_URL}/latest/stats.json" > "${TEMP_DIR}/stats.json"
python3 - "${TEMP_DIR}/stats.json" <<'PY'
import json
import sys

stats = json.load(open(sys.argv[1], encoding="utf-8"))
assert isinstance(stats.get("generated_at"), str), "missing generated_at"
assert isinstance(stats.get("total_downloads"), int), "missing total_downloads"
assert isinstance(stats.get("total_requests", 0), int), "invalid total_requests"
assert isinstance(stats.get("partial_requests", 0), int), "invalid partial_requests"
assert isinstance(stats.get("total_bytes"), int), "missing total_bytes"
assert isinstance(stats.get("countries"), list), "missing countries"
unattributed = stats.get("unattributed") or {"downloads": 0, "bytes": 0}
assert isinstance(unattributed.get("downloads"), int), unattributed
assert isinstance(unattributed.get("bytes"), int), unattributed
for country in stats["countries"][:5]:
    assert isinstance(country.get("downloads"), int), country
    assert isinstance(country.get("bytes"), int), country
    assert isinstance(country.get("regions"), list), country
assets = stats.get("assets") or []
assert isinstance(assets, list), "assets must be a list when present"
for asset in assets[:5]:
    assert isinstance(asset.get("name"), str), asset
    assert isinstance(asset.get("downloads"), int), asset
    assert isinstance(asset.get("bytes"), int), asset
print(
    f"stats downloads={stats['total_downloads']} "
    f"requests={stats.get('total_requests', 0)} "
    f"bytes={stats['total_bytes']} countries={len(stats['countries'])} "
    f"unattributed={unattributed['downloads']} assets={len(assets)}"
)
PY
curl -fsSI "${BASE_URL}/latest/stats.json" | grep -i '^cache-control:.*no-cache'

echo "Download mirror verification passed: ${ASSET_URL}"
