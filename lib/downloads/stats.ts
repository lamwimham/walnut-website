export interface DownloadRegionStats {
  regionCode?: string;
  regionName: string;
  downloads: number;
  bytes: number;
}

export interface DownloadCountryStats {
  countryCode?: string;
  countryName: string;
  downloads: number;
  bytes: number;
  regions: DownloadRegionStats[];
}

export interface DownloadUnattributedStats {
  downloads: number;
  bytes: number;
}

export interface DownloadStats {
  generatedAt?: string;
  totalDownloads: number;
  totalBytes: number;
  unattributed?: DownloadUnattributedStats;
  countries: DownloadCountryStats[];
}

interface CachedDownloadStats {
  data: DownloadStats;
  timestamp: number;
}

const CACHE_PREFIX = "walnut-download-stats-v1";
const CACHE_TTL_MS = 15 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  source: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function readNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return Math.floor(value);
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return Math.floor(parsed);
      }
    }
  }
  return 0;
}

function normalizeRegion(value: unknown): DownloadRegionStats | null {
  if (!isRecord(value)) return null;

  const regionName = readString(value, [
    "regionName",
    "region_name",
    "region",
    "name",
  ]);
  if (!regionName) return null;

  return {
    regionCode: readString(value, ["regionCode", "region_code", "code"]),
    regionName,
    downloads: readNumber(value, ["downloads", "download_count", "count"]),
    bytes: readNumber(value, ["bytes", "total_bytes"]),
  };
}

function normalizeCountry(value: unknown): DownloadCountryStats | null {
  if (!isRecord(value)) return null;

  const countryName = readString(value, [
    "countryName",
    "country_name",
    "country",
    "name",
  ]);
  const countryCode = readString(value, [
    "countryCode",
    "country_code",
    "code",
  ]);
  if (!countryName && !countryCode) return null;

  const regions = Array.isArray(value.regions)
    ? value.regions
        .map(normalizeRegion)
        .filter((region): region is DownloadRegionStats => region !== null)
        .sort((a, b) => b.downloads - a.downloads)
    : [];

  return {
    countryCode,
    countryName: countryName ?? countryCode ?? "Unknown",
    downloads: readNumber(value, ["downloads", "download_count", "count"]),
    bytes: readNumber(value, ["bytes", "total_bytes"]),
    regions,
  };
}

function normalizeUnattributed(value: unknown): DownloadUnattributedStats | null {
  if (!isRecord(value)) return null;

  const downloads = readNumber(value, ["downloads", "download_count", "count"]);
  const bytes = readNumber(value, ["bytes", "total_bytes"]);
  if (downloads <= 0 && bytes <= 0) return null;

  return { downloads, bytes };
}

export function normalizeDownloadStats(value: unknown): DownloadStats | null {
  if (!isRecord(value)) return null;

  const countries = Array.isArray(value.countries)
    ? value.countries
        .map(normalizeCountry)
        .filter((country): country is DownloadCountryStats => country !== null)
        .sort((a, b) => b.downloads - a.downloads)
    : [];

  const summedDownloads = countries.reduce(
    (total, country) => total + country.downloads,
    0
  );
  const summedBytes = countries.reduce(
    (total, country) => total + country.bytes,
    0
  );
  const totalDownloads =
    readNumber(value, ["totalDownloads", "total_downloads"]) ||
    summedDownloads;
  const totalBytes =
    readNumber(value, ["totalBytes", "total_bytes"]) || summedBytes;
  const explicitUnattributed = normalizeUnattributed(value.unattributed);
  const inferredUnattributed =
    !explicitUnattributed &&
    (totalDownloads > summedDownloads || totalBytes > summedBytes)
      ? {
          downloads: Math.max(0, totalDownloads - summedDownloads),
          bytes: Math.max(0, totalBytes - summedBytes),
        }
      : null;
  const unattributed = explicitUnattributed ?? inferredUnattributed ?? undefined;

  return {
    generatedAt: readString(value, ["generatedAt", "generated_at"]),
    totalDownloads,
    totalBytes,
    unattributed,
    countries,
  };
}

export function createDownloadStatsCacheKey(statsUrl: string): string {
  return `${CACHE_PREFIX}:${statsUrl}`;
}

export function getCachedDownloadStats(cacheKey: string): DownloadStats | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedDownloadStats;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;

    return normalizeDownloadStats(cached.data);
  } catch {
    return null;
  }
}

export function setCachedDownloadStats(cacheKey: string, data: DownloadStats) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // Download stats are optional telemetry; rendering must not depend on storage.
  }
}

export async function fetchDownloadStats(statsUrl: string): Promise<DownloadStats> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(statsUrl, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    const stats = normalizeDownloadStats(data);
    if (!stats) {
      throw new Error(`Invalid download stats from ${statsUrl}`);
    }
    return stats;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
