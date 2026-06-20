This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Download Stats

The landing page is a static export, so it does not write analytics itself. The
footer reads a public JSON file from the download mirror/CDN and renders the
global download total plus the top five countries.

The mirror operations module lives in `ops/download-mirror/`. It installs the
Nginx mirror endpoint, writes structured access logs, generates the public
`stats.json`, and verifies the public download manifests.

Configure the stats endpoint with:

```bash
NEXT_PUBLIC_WALNUT_DOWNLOAD_STATS_URL=https://dl.walnut.evofarm.top/downloads/latest/stats.json
```

Expected JSON shape:

```json
{
  "generated_at": "2026-06-02T12:00:00Z",
  "total_downloads": 8042,
  "total_requests": 12840,
  "partial_requests": 3900,
  "total_bytes": 92837498240,
  "unattributed": {
    "downloads": 12,
    "requests": 24,
    "partial_requests": 6,
    "bytes": 120348010
  },
  "countries": [
    {
      "country_code": "US",
      "country_name": "United States",
      "downloads": 3100,
      "requests": 4200,
      "partial_requests": 900,
      "bytes": 30493202000,
      "regions": [
        {
          "region_code": "CA",
          "region_name": "California",
          "downloads": 620,
          "requests": 830,
          "partial_requests": 180,
          "bytes": 6023000000
        }
      ]
    }
  ],
  "assets": [
    {
      "name": "Walnut_0.6.54_aarch64.dmg",
      "path": "/downloads/versions/0.6.54/Walnut_0.6.54_aarch64.dmg",
      "downloads": 510,
      "requests": 680,
      "partial_requests": 170,
      "bytes": 115623144822,
      "size": 170034037
    }
  ]
}
```

The parser also accepts camelCase keys such as `generatedAt`,
`totalDownloads`, `countryCode`, and `countryName`.

Useful mirror commands:

```bash
# Generate public stats from local or remote Nginx logs.
python3 ops/download-mirror/generate-download-stats.py \
  --log /var/log/nginx/walnut-downloads-access.log.1 \
  --log /var/log/nginx/walnut-downloads-access.log \
  --output /var/www/walnut/downloads/stats/stats.json \
  --state /var/lib/walnut-download-stats/state.json \
  --asset-root /var/www/walnut/downloads

# Verify the deployed mirror manifests and public stats endpoint.
DOMAIN=dl.walnut.evofarm.top ops/download-mirror/verify-download-mirror.sh
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
