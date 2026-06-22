export type AccountRuntimeConfig = {
  websitePublicUrl: string;
  billingInternalBaseUrl: string;
  hasBillingInternalToken: boolean;
  hasGoogleOAuthClient: boolean;
  hasGoogleOAuthSecret: boolean;
  hasSessionSecret: boolean;
  cookieDomain: string;
  returnUrlAllowlist: string[];
  googleOneTapAllowedOrigins: string[];
};

const DEFAULT_RETURN_URLS = ["walnut://access/oauth/google/success"];

function normalizedEnvUrl(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

function splitCsv(value: string | undefined): string[] {
  return value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) ?? [];
}

function splitAllowlist(value: string | undefined): string[] {
  const entries = splitCsv(value);
  return entries.length ? entries : DEFAULT_RETURN_URLS;
}

function googleOneTapOrigins(value: string | undefined, websitePublicUrl: string): string[] {
  const explicitOrigins = splitCsv(value)
    .map(normalizedEnvUrl)
    .filter(Boolean);
  return explicitOrigins.length ? explicitOrigins : [websitePublicUrl].filter(Boolean);
}

export function accountRuntimeConfig(): AccountRuntimeConfig {
  const websitePublicUrl = normalizedEnvUrl(process.env.WALNUT_WEBSITE_PUBLIC_URL);
  return {
    websitePublicUrl,
    billingInternalBaseUrl: normalizedEnvUrl(process.env.WALNUT_BILLING_INTERNAL_BASE_URL),
    hasBillingInternalToken: Boolean(process.env.WALNUT_BILLING_INTERNAL_TOKEN?.trim()),
    hasGoogleOAuthClient: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID?.trim()),
    hasGoogleOAuthSecret: Boolean(process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim()),
    hasSessionSecret: Boolean(process.env.AUTH_SESSION_SECRET?.trim()),
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN?.trim() ?? "",
    returnUrlAllowlist: splitAllowlist(process.env.AUTH_RETURN_URL_ALLOWLIST),
    googleOneTapAllowedOrigins: googleOneTapOrigins(process.env.GOOGLE_ONE_TAP_ALLOWED_ORIGINS, websitePublicUrl),
  };
}

export function googleOAuthReady(config = accountRuntimeConfig()): boolean {
  return Boolean(config.hasGoogleOAuthClient && config.hasGoogleOAuthSecret && config.hasSessionSecret);
}

export function billingBridgeReady(config = accountRuntimeConfig()): boolean {
  return Boolean(config.billingInternalBaseUrl && config.hasBillingInternalToken);
}
