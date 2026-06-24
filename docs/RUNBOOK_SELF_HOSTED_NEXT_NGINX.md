# Runbook: Self-hosted Walnut Website on Node Next + Nginx

Status: Draft / P0 account portal deployment
Created: 2026-06-21

## Goal

Run `walnut-website` as a serverful Next.js application so Account Portal, Auth.js Google login, route handlers, and server-to-server billing calls work in production. Static export remains an opt-in fallback for marketing-only mirrors.

## Runtime shape

```text
Internet
  -> Nginx TLS termination
    -> Node.js Next server on 127.0.0.1:3000
      -> Auth.js Google OAuth callback
      -> walnut-billing internal API over HTTPS or private network
```

## Required environment

```env
NODE_ENV=production
PORT=3000
WALNUT_WEBSITE_PUBLIC_URL=https://www.walnut.xxx
NEXT_PUBLIC_WALNUT_WEBSITE_PUBLIC_URL=https://www.walnut.xxx
AUTH_URL=https://www.walnut.xxx
NEXTAUTH_URL=https://www.walnut.xxx
WALNUT_BILLING_INTERNAL_BASE_URL=https://billing.walnut.xxx
WALNUT_BILLING_INTERNAL_TOKEN=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
AUTH_SECRET=...
AUTH_SESSION_SECRET=...
AUTH_TRUST_HOST=true
AUTH_RETURN_URL_ALLOWLIST=walnut://access/oauth/google/success
WALNUT_CHECKOUT_PROVIDER=creem
NEXT_PUBLIC_WALNUT_DEMO_VIDEO_URL=
```

Notes:

- `AUTH_SECRET` is used by Auth.js. Keep it stable across deploys.
- `AUTH_SESSION_SECRET` is retained as Walnut's own config guard and can match `AUTH_SECRET` initially.
- `WALNUT_WEBSITE_PUBLIC_URL` drives server-side absolute URLs for canonical,
  sitemap, robots, billing redirects, and structured data. Keep it identical to
  the canonical production host.
- `AUTH_URL` / `NEXTAUTH_URL` must use the same public origin so Auth.js
  generates `https://www.walnut.xxx/api/auth/callback/google`, not the internal
  `localhost:3000` container address. The app also derives these from
  `WALNUT_WEBSITE_PUBLIC_URL` in production as a guardrail.
- `NEXT_PUBLIC_WALNUT_DEMO_VIDEO_URL` is optional. Leave it empty until a real
  demo video is deployed; the landing page will render a static product mockup
  instead of referencing a missing `/demo.mp4`.
- Never expose billing internal token to the browser or `NEXT_PUBLIC_*` variables.

## Build and run

```bash
npm ci
npm run build
npm run start
```

By default this is serverful. Only use static export for marketing-only deployments:

```bash
WALNUT_STATIC_EXPORT=true npm run build
```

## Nginx example

```nginx
server {
  listen 80;
  server_name www.walnut.xxx;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name www.walnut.xxx;

  ssl_certificate /etc/letsencrypt/live/www.walnut.xxx/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/www.walnut.xxx/privkey.pem;

  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header X-Frame-Options DENY always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## SEO checks

- `/` is a marketing route and must not call account/session APIs. It should be
  cacheable and should not return `Cache-Control: private` or `no-store`.
- `/` remains indexable and keeps structured data from `lib/seo/site.ts`.
- `/login`, `/login/device`, `/account`, `/account/billing`, `/auth/*`, and `/api/auth/*` must be noindex or non-HTML API routes.
- `robots.txt` and `sitemap.xml` are generated from `app/robots.ts`,
  `app/sitemap.ts`, and `lib/seo/routes.ts` so canonical URLs, lastmod, and
  sitemap entries share one route registry.
- `llms.txt`, favicons, and OG image remain served from `public/`.

## Smoke test

```bash
curl -I https://www.walnut.xxx/
curl -I http://www.walnut.xxx/
curl -I https://www.walnut.xxx/login
curl -I https://www.walnut.xxx/api/auth/signin
curl -sS https://www.walnut.xxx/sitemap.xml
```

Expected:

- `/` returns 200, indexable metadata, and a public/cacheable response.
- `http://` redirects to the canonical `https://` URL with 301.
- `/login` returns 200 with `robots: noindex` metadata.
- `/api/auth/signin` is served by Auth.js and does not expose secrets.
- `/sitemap.xml` lists only canonical indexable marketing URLs.
