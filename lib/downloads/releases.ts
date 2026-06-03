export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface ReleaseInfo {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
}

interface CachedRelease {
  data: ReleaseInfo;
  timestamp: number;
}

interface ReleaseSource {
  url: string;
  retries: number;
  timeoutMs: number;
  headers?: HeadersInit;
}

const CACHE_PREFIX = "walnut-release-cache-v3";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function isReleaseInfo(value: unknown): value is ReleaseInfo {
  if (!value || typeof value !== "object") return false;
  const release = value as Partial<ReleaseInfo>;
  return (
    typeof release.tag_name === "string" &&
    typeof release.html_url === "string" &&
    Array.isArray(release.assets) &&
    release.assets.every(
      (asset) =>
        asset &&
        typeof asset === "object" &&
        typeof asset.name === "string" &&
        typeof asset.browser_download_url === "string" &&
        typeof asset.size === "number"
    )
  );
}

export function createReleaseCacheKey(
  repoOwner: string,
  repoName: string,
  mirrorManifestUrl?: string
): string {
  const source = mirrorManifestUrl ? `mirror:${mirrorManifestUrl}` : "github";
  return `${CACHE_PREFIX}:${repoOwner}/${repoName}:${source}`;
}

export function getCachedRelease(cacheKey: string): ReleaseInfo | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedRelease;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return isReleaseInfo(cached.data) ? cached.data : null;
  } catch {
    return null;
  }
}

export function setCachedRelease(cacheKey: string, data: ReleaseInfo) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Storage is an optional optimization; downloads still work without it.
  }
}

async function fetchWithRetry(source: ReleaseSource): Promise<ReleaseInfo> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < source.retries; attempt++) {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), source.timeoutMs);
    try {
      const response = await fetch(source.url, {
        headers: source.headers,
        signal: controller.signal,
      });
      if (response.ok) {
        const data: unknown = await response.json();
        if (!isReleaseInfo(data)) {
          throw new Error(`Invalid release manifest from ${source.url}`);
        }
        return data;
      }
      if (response.status !== 403 && response.status < 500) {
        throw new Error(`HTTP ${response.status}`);
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    } finally {
      globalThis.clearTimeout(timeout);
    }
    if (attempt < source.retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error(`Failed to fetch ${source.url}`);
}

export async function fetchLatestRelease(
  repoOwner: string,
  repoName: string,
  mirrorManifestUrl?: string
): Promise<ReleaseInfo> {
  const sources: ReleaseSource[] = [];
  if (mirrorManifestUrl) {
    // Fail over quickly while the mirror is being deployed or maintained.
    sources.push({ url: mirrorManifestUrl, retries: 1, timeoutMs: 2500 });
  }
  sources.push({
    url: `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
    retries: 3,
    timeoutMs: 8000,
    headers: { Accept: "application/vnd.github+json" },
  });

  let lastError: Error | undefined;
  for (const source of sources) {
    try {
      return await fetchWithRetry(source);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError ?? new Error("No release source is configured");
}
