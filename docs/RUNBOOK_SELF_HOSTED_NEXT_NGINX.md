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
WALNUT_BILLING_INTERNAL_BASE_URL=https://billing.walnut.xxx
WALNUT_BILLING_INTERNAL_TOKEN=...
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
AUTH_SECRET=...
AUTH_SESSION_SECRET=...
AUTH_TRUST_HOST=true
AUTH_RETURN_URL_ALLOWLIST=walnut://access/oauth/google/success
```

Notes:

- `AUTH_SECRET` is used by Auth.js. Keep it stable across deploys.
- `AUTH_SESSION_SECRET` is retained as Walnut's own config guard and can match `AUTH_SECRET` initially.
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

- `/` remains indexable and keeps structured data from `lib/seo/site.ts`.
- `/login`, `/login/device`, `/account`, `/account/billing`, `/auth/*`, and `/api/auth/*` must be noindex or non-HTML API routes.
- `robots.txt`, `sitemap.xml`, `llms.txt`, favicons, and OG image remain served from `public/`.

## Smoke test

```bash
curl -I https://www.walnut.xxx/
curl -I https://www.walnut.xxx/login
curl -I https://www.walnut.xxx/api/auth/signin
```

Expected:

- `/` returns 200 and indexable metadata.
- `/login` returns 200 with `robots: noindex` metadata.
- `/api/auth/signin` is served by Auth.js and does not expose secrets.
