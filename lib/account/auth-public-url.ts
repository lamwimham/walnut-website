import { firstNormalizedEnvOrigin, isLocalOrigin, normalizedEnvOrigin } from "@/lib/env/origin";

type AuthUrlEnv = {
  AUTH_URL?: string;
  NEXTAUTH_URL?: string;
  WALNUT_WEBSITE_PUBLIC_URL?: string;
  NEXT_PUBLIC_WALNUT_WEBSITE_PUBLIC_URL?: string;
  NODE_ENV?: string;
};

const PUBLIC_URL_ENV_KEYS = [
  "WALNUT_WEBSITE_PUBLIC_URL",
  "NEXT_PUBLIC_WALNUT_WEBSITE_PUBLIC_URL",
] as const;

const AUTH_URL_ENV_KEYS = ["AUTH_URL", "NEXTAUTH_URL"] as const;

function firstOrigin(env: AuthUrlEnv, keys: readonly (keyof AuthUrlEnv)[]): string {
  return firstNormalizedEnvOrigin(keys.map((key) => env[key]));
}

export function resolveAuthPublicUrl(env: AuthUrlEnv = process.env): string {
  const authUrl = firstOrigin(env, AUTH_URL_ENV_KEYS);
  const websiteUrl = firstOrigin(env, PUBLIC_URL_ENV_KEYS);

  if (env.NODE_ENV === "production" && websiteUrl && isLocalOrigin(authUrl)) {
    return websiteUrl;
  }

  return authUrl || websiteUrl;
}

export function installAuthPublicUrlEnv(env: NodeJS.ProcessEnv = process.env): string {
  const publicUrl = resolveAuthPublicUrl(env);
  if (!publicUrl) return "";

  for (const key of AUTH_URL_ENV_KEYS) {
    const current = normalizedEnvOrigin(env[key]);
    if (!current || (env.NODE_ENV === "production" && isLocalOrigin(current))) {
      env[key] = publicUrl;
    }
  }

  return publicUrl;
}
