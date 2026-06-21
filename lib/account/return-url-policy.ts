import { accountRuntimeConfig } from "./config";

export function isAllowedReturnUrl(value: string, allowlist = accountRuntimeConfig().returnUrlAllowlist): boolean {
  const raw = value.trim();
  if (!raw) return false;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "walnut:") {
      return allowlist.some((allowed) => raw.startsWith(allowed));
    }
    if (parsed.protocol === "https:") {
      return allowlist.includes(`${parsed.protocol}//${parsed.host}${parsed.pathname}`);
    }
  } catch {
    return raw.startsWith("/") && !raw.startsWith("//");
  }

  return false;
}

export function safeReturnUrl(value: string | null | undefined, fallback = "/account"): string {
  const raw = value?.trim() ?? "";
  return isAllowedReturnUrl(raw) ? raw : fallback;
}
