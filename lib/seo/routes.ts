import type { MetadataRoute } from "next";

const DEFAULT_SITE_ORIGIN = "https://walnut.evofarm.top";

type AbsolutePath = `/${string}`;

export type SeoRouteKey = "home";

export interface SeoRoute {
  key: SeoRouteKey;
  path: AbsolutePath;
  title: string;
  description: string;
  keywords: string[];
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  includeInSitemap: boolean;
}

function normalizedSiteOrigin(): string {
  const configuredOrigin =
    process.env.WALNUT_WEBSITE_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_WALNUT_WEBSITE_PUBLIC_URL ??
    DEFAULT_SITE_ORIGIN;

  return configuredOrigin.trim().replace(/\/+$/, "") || DEFAULT_SITE_ORIGIN;
}

export const siteConfig = {
  origin: normalizedSiteOrigin(),
  brandName: "Walnut",
  parentBrandName: "EvoFarm",
  parentBrandUrl: "https://www.evofarm.top",
} as const;

export function absoluteUrl(path: AbsolutePath): string {
  return `${siteConfig.origin}${path}`;
}

export const seoRoutes: Record<SeoRouteKey, SeoRoute> = {
  home: {
    key: "home",
    path: "/",
    title: "Walnut LLM Wiki - Local-first Second Brain for Personal AI Agents",
    description:
      "Walnut is a local-first LLM wiki for building the memory layer of your future personal AI agent. Turn notes, links, and fragments into an indexed second brain you own.",
    keywords: [
      "Walnut",
      "Walnut LLM Wiki",
      "llm wiki",
      "llm-wiki",
      "local-first second brain",
      "personal AI agent",
      "AI memory layer",
      "knowledge management",
      "personal knowledge graph",
    ],
    lastModified: "2026-06-24",
    changeFrequency: "weekly",
    priority: 1,
    includeInSitemap: true,
  },
};

export function sitemapRoutes(): SeoRoute[] {
  return Object.values(seoRoutes).filter((route) => route.includeInSitemap);
}
