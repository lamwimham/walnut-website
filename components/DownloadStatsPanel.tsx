"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import {
  createDownloadStatsCacheKey,
  fetchDownloadStats,
  getCachedDownloadStats,
  setCachedDownloadStats,
  type DownloadStats,
} from "@/lib/downloads/stats";

interface DownloadStatsPanelProps {
  statsUrl?: string;
  className?: string;
  topCountryLimit?: number;
}

interface DownloadStatsState {
  cacheKey: string;
  stats: DownloadStats | null;
  loading: boolean;
  error: boolean;
}

function createInitialState(cacheKey: string): DownloadStatsState {
  const cached = cacheKey ? getCachedDownloadStats(cacheKey) : null;
  return {
    cacheKey,
    stats: cached,
    loading: !cached,
    error: false,
  };
}

function formatBytes(bytes: number, locale: string): string {
  if (bytes <= 0) return "0 MB";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value)} ${units[unitIndex]}`;
}

function getRegionDisplayNameOverride(
  countryCode: string,
  locale: string
): string | null {
  const normalizedCode = countryCode.toUpperCase();
  if (normalizedCode !== "HK") return null;

  return locale.startsWith("zh") ? "中国香港" : "Hong Kong, China";
}

function formatCountryName(
  countryCode: string | undefined,
  fallbackName: string,
  locale: string
): string {
  if (!countryCode) return fallbackName;

  const override = getRegionDisplayNameOverride(countryCode, locale);
  if (override) return override;

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(countryCode.toUpperCase()) ?? fallbackName;
  } catch {
    return fallbackName;
  }
}

export default function DownloadStatsPanel({
  statsUrl,
  className = "",
  topCountryLimit = 5,
}: DownloadStatsPanelProps) {
  const { t, isZh } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const locale = isZh ? "zh-CN" : "en-US";
  const cacheKey = useMemo(
    () => (statsUrl ? createDownloadStatsCacheKey(statsUrl) : ""),
    [statsUrl]
  );
  const [state, setState] = useState<DownloadStatsState>(() =>
    createInitialState(cacheKey)
  );

  useEffect(() => {
    if (!statsUrl) return;

    let cancelled = false;
    const cached = getCachedDownloadStats(cacheKey);

    async function fetchStats() {
      try {
        const nextStats = await fetchDownloadStats(statsUrl!);
        if (!cancelled) {
          setCachedDownloadStats(cacheKey, nextStats);
          setState({
            cacheKey,
            stats: nextStats,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            cacheKey,
            stats: cached,
            loading: false,
            error: !cached,
          });
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [statsUrl, cacheKey]);

  if (!statsUrl) return null;

  const activeState = state.cacheKey === cacheKey
    ? state
    : createInitialState(cacheKey);
  const { stats, loading, error } = activeState;
  const topCountries = (stats?.countries ?? []).slice(0, topCountryLimit);
  const maxDownloads = Math.max(
    1,
    ...topCountries.map((country) => country.downloads)
  );
  const totalDownloads = stats?.totalDownloads ?? 0;
  const unattributedDownloads = stats?.unattributed?.downloads ?? 0;
  const generatedAt =
    stats?.generatedAt && !Number.isNaN(new Date(stats.generatedAt).getTime())
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(stats.generatedAt))
      : null;

  if (loading && !stats) {
    return (
      <div className={`download-stats-card rounded-3xl p-5 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="h-3 w-28 rounded-full bg-white/8 animate-pulse" />
            <div className="mt-4 h-8 w-40 rounded-full bg-white/8 animate-pulse" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white/8 animate-pulse" />
        </div>
        <div className="mt-5 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`download-stats-card rounded-3xl p-5 text-center ${className}`}>
        <p className="section-kicker mb-2">{t("downloads.stats.label")}</p>
        <p className="text-sm text-text-muted leading-relaxed">
          {t("downloads.stats.unavailable")}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={`download-stats-card rounded-3xl p-5 sm:p-6 ${className}`}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6 }}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr] lg:items-center">
        <div>
          <span className="section-kicker mb-3">
            {t("downloads.stats.label")}
          </span>
          <p className="text-xs uppercase tracking-[0.28em] text-text-muted">
            {t("downloads.stats.title")}
          </p>
          <div className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-[-0.045em] text-text-primary">
            {new Intl.NumberFormat(locale).format(totalDownloads)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
            {stats?.totalBytes ? (
              <span className="rounded-full border border-border-subtle bg-white/[0.025] px-3 py-1">
                {t("downloads.stats.totalBytes", {
                  bytes: formatBytes(stats.totalBytes, locale),
                })}
              </span>
            ) : null}
            {unattributedDownloads > 0 ? (
              <span className="rounded-full border border-border-subtle bg-white/[0.025] px-3 py-1">
                {t("downloads.stats.unattributed", {
                  downloads: new Intl.NumberFormat(locale).format(
                    unattributedDownloads
                  ),
                })}
              </span>
            ) : null}
            {generatedAt ? (
              <span className="rounded-full border border-border-subtle bg-white/[0.025] px-3 py-1">
                {t("downloads.stats.updated", { time: generatedAt })}
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.24em] text-neural-soft">
              {t("downloads.stats.topCountries")}
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">
              {t("downloads.stats.downloadsShort")}
            </p>
          </div>

          {topCountries.length > 0 ? (
            <div className="space-y-2.5">
              {topCountries.map((country, index) => {
                const percent = Math.max(
                  7,
                  (country.downloads / maxDownloads) * 100
                );
                const topRegion = country.regions[0];
                const countryName = formatCountryName(
                  country.countryCode,
                  country.countryName,
                  locale
                );

                return (
                  <div
                    key={`${country.countryCode ?? country.countryName}-${index}`}
                    className="relative overflow-hidden rounded-2xl border border-white/[0.055] bg-white/[0.025] px-3 py-2.5"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,rgba(79,209,197,0.14),rgba(124,104,245,0.05))]"
                      style={{ width: `${percent}%` }}
                      aria-hidden="true"
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.64rem] text-text-muted">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="truncate text-sm text-text-primary">
                            {countryName}
                          </span>
                          {country.countryCode ? (
                            <span className="rounded-full border border-border-subtle px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest text-text-muted">
                              {country.countryCode}
                            </span>
                          ) : null}
                        </div>
                        {topRegion ? (
                          <p className="mt-1 truncate pl-8 text-[0.66rem] text-text-muted">
                            {t("downloads.stats.topRegion", {
                              region: topRegion.regionName,
                            })}
                          </p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right text-sm font-medium text-neural-soft">
                        {new Intl.NumberFormat(locale).format(country.downloads)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-border-subtle bg-white/[0.025] px-4 py-4 text-sm text-text-muted">
              {t("downloads.stats.empty")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
