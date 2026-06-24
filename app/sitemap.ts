import type { MetadataRoute } from "next";
import { absoluteUrl, sitemapRoutes } from "@/lib/seo/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes().map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
