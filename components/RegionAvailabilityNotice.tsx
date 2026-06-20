"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";

declare global {
  interface Window {
    __WALNUT_VISITOR_COUNTRY__?: string;
  }
}

type GeoResponse = {
  cfCountry?: string;
  cf_country?: string;
  country?: string;
  countryCode?: string;
  country_code?: string;
  country_code2?: string;
  country_name?: string;
};

const GEOIP_ENDPOINT =
  process.env.NEXT_PUBLIC_GEOIP_ENDPOINT ?? "/__walnut/geoip";

function normalizeCountryCode(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

function isMainlandChina(countryCode: string): boolean {
  return normalizeCountryCode(countryCode) === "CN";
}

function getCountryFromGeoResponse(data: GeoResponse): string {
  return normalizeCountryCode(
    data.cfCountry ??
      data.cf_country ??
      data.countryCode ??
      data.country_code ??
      data.country_code2 ??
      data.country
  );
}

function readInjectedCountryCode(): string {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  const qaOverride = params.get("walnut_country");
  if (qaOverride) return normalizeCountryCode(qaOverride);

  const metaCountry = document
    .querySelector<HTMLMetaElement>('meta[name="visitor-country"]')
    ?.content;

  return normalizeCountryCode(
    window.__WALNUT_VISITOR_COUNTRY__ ??
      document.documentElement.dataset.visitorCountry ??
      metaCountry
  );
}

export default function RegionAvailabilityNotice() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detectRegion() {
      const injectedCountry = readInjectedCountryCode();
      if (isMainlandChina(injectedCountry)) {
        setShowNotice(true);
        return;
      }

      if (!GEOIP_ENDPOINT) return;

      try {
        const response = await fetch(GEOIP_ENDPOINT, {
          cache: "no-store",
          credentials: "omit",
        });
        if (!response.ok) return;

        const data = (await response.json()) as GeoResponse;
        if (!cancelled && isMainlandChina(getCountryFromGeoResponse(data))) {
          setShowNotice(true);
        }
      } catch {
        // Region detection is best-effort; avoid blocking the page if it fails.
      }
    }

    detectRegion();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!showNotice) return null;

  return (
    <motion.aside
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative z-20 pt-16"
    >
      <div className="border-y border-soul/20 bg-[linear-gradient(90deg,rgba(213,180,106,0.13),rgba(17,18,28,0.92)_34%,rgba(79,209,197,0.055))] px-4 py-3 shadow-[0_12px_44px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-soul/30 bg-soul/10 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-soul">
            <span className="h-1.5 w-1.5 rounded-full bg-soul shadow-[0_0_14px_rgba(213,180,106,0.6)]" />
            {t("regionNotice.label")}
          </span>
          <p className="text-sm leading-relaxed text-text-secondary">
            {t("regionNotice.message")}
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
