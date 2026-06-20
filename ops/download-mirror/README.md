# Walnut Download Mirror Ops

This directory owns the download mirror and public download telemetry for
`walnut.evofarm.top`.

## Files

- `generate-download-stats.py` reads Nginx access logs and emits the public
  aggregate `stats.json`.
- `install-nginx.sh` installs the Nginx mirror, structured log format, GeoIP
  module, TLS certificate, stats generator, and cron job.
- `verify-download-mirror.sh` verifies the deployed mirror manifests, immutable
  asset headers, byte-range support, and public stats endpoint.

## Stats Contract

The website is a static export and does not collect analytics. The mirror logs
are the source of truth. The public `stats.json` intentionally contains only
aggregates:

- `total_downloads` counts inferred completed downloads.
- `total_requests` and `partial_requests` count accepted HTTP requests.
- `total_bytes` counts bytes transferred by accepted download requests.
- `countries` contains geolocated country/region buckets for the leaderboard.
- `unattributed` contains requests that could not be mapped to a country.
- `assets` contains privacy-safe file-level aggregates.

Raw IPs, user agents, and request identifiers must stay on the server/CDN logs
and should not be published.

## Why Totals Can Exceed Country Rows

Older stats files omitted the `Unknown` country bucket from `countries` but kept
those requests in `total_downloads`. That made the public total look larger than
the visible country rows. The generator now exposes those requests through the
`unattributed` bucket so the frontend can explain the difference without making
`Unknown` a Top Countries entry.

## Mirror Abuse Controls

The Nginx installer applies defense in depth for direct-download abuse:

- Per-IP concurrent connection limits with `limit_conn`.
- Per-IP request-rate limits with `limit_req`.
- Per-connection bandwidth shaping with `limit_rate`.
- A cap on multi-range requests with `max_ranges`.
- Immutable cache headers for versioned assets so a CDN can safely sit in front
  of the origin.

For stronger protection, put the mirror behind a CDN/WAF, cache
`/downloads/versions/*` at the edge, and allow the origin to receive traffic only
from CDN IP ranges.
