"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  createReleaseCacheKey,
  fetchLatestRelease,
  getCachedRelease,
  setCachedRelease,
  type ReleaseAsset,
  type ReleaseInfo,
} from "@/lib/downloads/releases";

interface DownloadButtonsProps {
  repoOwner: string;
  repoName: string;
  productName?: string;
  className?: string;
  showVersion?: boolean;
  fallbackLabel?: string;
  mirrorManifestUrl?: string;
}

type Platform = "mac" | "win" | "linux" | null;
type SupportedPlatform = Exclude<Platform, null>;

interface ClassifiedAsset extends ReleaseAsset {
  platform: SupportedPlatform;
  label: string;
  arch?: string;
  isPrimary: boolean;
}

interface ReleaseState {
  cacheKey: string;
  release: ReleaseInfo | null;
  loading: boolean;
  error: boolean;
}

function initialReleaseState(cacheKey: string): ReleaseState {
  return {
    cacheKey,
    release: null,
    loading: true,
    error: false,
  };
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const platform = navigator.platform?.toLowerCase() || "";
  const userAgent = navigator.userAgent?.toLowerCase() || "";

  if (
    platform.includes("mac") ||
    platform.includes("darwin") ||
    userAgent.includes("mac os")
  ) {
    return "mac";
  }
  if (
    platform.includes("win") ||
    userAgent.includes("windows")
  ) {
    return "win";
  }
  if (
    platform.includes("linux") ||
    userAgent.includes("linux")
  ) {
    return "linux";
  }
  return null;
}

function classifyAsset(name: string): { platform: SupportedPlatform; label: string; arch?: string } | null {
  const lower = name.toLowerCase();

  if (
    lower.endsWith(".sig") ||
    lower === "latest.json" ||
    lower === "downloads.json" ||
    lower === "checksums.txt"
  ) {
    return null;
  }

  if (lower.endsWith(".dmg")) {
    if (lower.includes("aarch64") || lower.includes("arm64")) {
      return { platform: "mac", label: "macOS", arch: "Apple Silicon" };
    }
    return { platform: "mac", label: "macOS" };
  }

  if (lower.endsWith(".exe")) {
    if (lower.includes("x64") || lower.includes("amd64")) {
      return { platform: "win", label: "Windows", arch: "x64 .exe" };
    }
    return { platform: "win", label: "Windows", arch: ".exe" };
  }
  if (lower.endsWith(".msi")) {
    return { platform: "win", label: "Windows", arch: ".msi" };
  }

  // Tauri macOS updater archives are not first-install packages for browsers.
  if (lower.endsWith(".app.tar.gz")) {
    return null;
  }

  if (lower.endsWith(".appimage")) {
    return { platform: "linux", label: "Linux", arch: "AppImage" };
  }
  if (lower.endsWith(".deb")) {
    return { platform: "linux", label: "Linux", arch: ".deb" };
  }
  if (lower.endsWith(".rpm")) {
    return { platform: "linux", label: "Linux", arch: ".rpm" };
  }
  if (lower.endsWith(".tar.gz")) {
    return { platform: "linux", label: "Linux", arch: "tar.gz" };
  }

  return null;
}

function pickBestAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | null {
  const classified = assets
    .map((a) => ({ asset: a, info: classifyAsset(a.name) }))
    .filter((x): x is typeof x & { info: NonNullable<typeof x.info> } => x.info !== null);

  if (platform) {
    const match = classified.find((x) => x.info.platform === platform);
    if (match) return match.asset;
  }

  // Default: first available
  return classified[0]?.asset ?? null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

export default function DownloadButtons({
  repoOwner,
  repoName,
  productName = "",
  className = "",
  showVersion = true,
  fallbackLabel: fallbackLabelProp,
  mirrorManifestUrl,
}: DownloadButtonsProps) {
  const shouldReduceMotion = useReducedMotion();
  const cacheKey = useMemo(
    () => createReleaseCacheKey(repoOwner, repoName, mirrorManifestUrl),
    [repoOwner, repoName, mirrorManifestUrl]
  );
  const [releaseState, setReleaseState] = useState<ReleaseState>(() =>
    initialReleaseState(cacheKey)
  );
  const activeState = releaseState.cacheKey === cacheKey
    ? releaseState
    : initialReleaseState(cacheKey);
  const { release, loading, error } = activeState;

  const userPlatform = useMemo(() => detectPlatform(), []);
  const fallbackLabel = fallbackLabelProp ?? (
    productName ? `Download ${productName}` : "Download latest"
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchRelease() {
      const cached = getCachedRelease(cacheKey);
      if (cached) {
        globalThis.queueMicrotask(() => {
          if (!cancelled) {
            setReleaseState({
              cacheKey,
              release: cached,
              loading: false,
              error: false,
            });
          }
        });
      }

      try {
        const data = await fetchLatestRelease(
          repoOwner,
          repoName,
          mirrorManifestUrl
        );
        if (!cancelled) {
          setCachedRelease(cacheKey, data);
          setReleaseState({
            cacheKey,
            release: data,
            loading: false,
            error: false,
          });
        }
      } catch {
        if (!cancelled) {
          setReleaseState({
            cacheKey,
            release: cached,
            loading: false,
            error: !cached,
          });
        }
      }
    }

    fetchRelease();
    return () => {
      cancelled = true;
    };
  }, [repoOwner, repoName, mirrorManifestUrl, cacheKey]);

  const downloads = useMemo(() => {
    if (!release) return [];
    const primaryAsset = pickBestAsset(release.assets, userPlatform);
    const items: ClassifiedAsset[] = release.assets
      .map((asset) => {
        const info = classifyAsset(asset.name);
        if (!info) return null;
        return {
          ...asset,
          platform: info.platform,
          label: info.label,
          arch: info.arch,
          isPrimary: asset.browser_download_url === primaryAsset?.browser_download_url,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const platformOrder: Record<SupportedPlatform, number> = {
      mac: 0,
      win: 1,
      linux: 2,
    };

    items.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return platformOrder[a.platform] - platformOrder[b.platform];
    });

    return items;
  }, [release, userPlatform]);

  const fallbackUrl = `https://github.com/${repoOwner}/${repoName}/releases/latest`;

  if (loading) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
        <div className="h-11 w-36 rounded-full bg-white/5 animate-pulse" />
        <div className="h-11 w-36 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <motion.a
          href={fallbackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-cta group flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        >
          <DownloadIcon className="relative z-10 w-4 h-4" />
          <span className="relative z-10">{fallbackLabel}</span>
        </motion.a>
      </div>
    );
  }

  const versionLabel = release.tag_name;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        {downloads.map((dl) => (
          <motion.a
            key={dl.name}
            href={dl.browser_download_url}
            className={`group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              dl.isPrimary
                ? "primary-cta text-white"
                : "secondary-cta text-text-secondary hover:text-text-primary"
            }`}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            title={`${dl.label}${dl.arch ? ` (${dl.arch})` : ""} — ${formatBytes(dl.size)}`}
          >
            {dl.platform === "mac" ? (
              <AppleIcon className="relative z-10 w-4 h-4" />
            ) : dl.platform === "win" ? (
              <WindowsIcon className="relative z-10 w-4 h-4" />
            ) : (
              <DownloadIcon className="relative z-10 w-4 h-4" />
            )}
            <span className="relative z-10">
              {dl.label}
              {dl.arch && (
                <span className="ml-1 opacity-60 text-xs">{dl.arch}</span>
              )}
            </span>
          </motion.a>
        ))}

        {downloads.length === 0 && (
          <motion.a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-cta group flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all duration-300"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          >
            <DownloadIcon className="relative z-10 w-4 h-4" />
            <span className="relative z-10">{fallbackLabel}</span>
          </motion.a>
        )}
      </div>

      {showVersion && (
        <a
          href={release.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-muted hover:text-neural-soft transition-colors"
        >
          {versionLabel}
        </a>
      )}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.7-3.06 1.58-.67.78-1.26 2.02-1.1 3.23 1.17.09 2.36-.75 3.09-1.7z"/>
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
    </svg>
  );
}
