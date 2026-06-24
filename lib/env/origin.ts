function unquoteEnvValue(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === "'" || quote === "\"") && trimmed.at(-1) === quote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

export function normalizedEnvOrigin(value: string | undefined): string {
  const raw = value ? unquoteEnvValue(value) : "";
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
}

export function firstNormalizedEnvOrigin(values: Iterable<string | undefined>): string {
  for (const value of values) {
    const origin = normalizedEnvOrigin(value);
    if (origin) return origin;
  }
  return "";
}

export function isLocalOrigin(origin: string): boolean {
  if (!origin) return false;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}
