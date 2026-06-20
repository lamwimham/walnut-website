import type { Metadata } from "next";

const siteOrigin = "https://walnut.evofarm.top";
const siteUrl = `${siteOrigin}/`;
const brandName = "Walnut";
const parentBrandName = "EvoFarm";
const parentBrandUrl = "https://www.evofarm.top";
const title = "Walnut — The Foundation of Your Future Personal Agent";
const description =
  "Walnut is your llm-wiki. Memory to AI, index to yourself. Taste cannot be copied. Soul accumulates over time. Walnut is not a knowledge base — it is the unique personality training dataset for your future personal Agent.";

const absoluteUrl = (path: `/${string}`) => `${siteOrigin}${path}`;

const logo = {
  url: absoluteUrl("/logo.png"),
  width: 800,
  height: 800,
  alt: `${brandName} logo`,
} as const;

const ogImage = {
  url: absoluteUrl("/og-image.png"),
  width: 1200,
  height: 630,
  alt: title,
} as const;

const organizationId = `${siteUrl}#organization`;
const websiteId = `${siteUrl}#website`;
const softwareId = `${siteUrl}#software`;
const logoId = `${siteUrl}#logo`;

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  keywords: [
    brandName,
    "llm-wiki",
    "second brain",
    "personal Agent",
    "knowledge management",
    "AI",
    "indexing",
    "soul data",
  ],
  authors: [{ name: brandName, url: siteUrl }],
  creator: brandName,
  publisher: parentBrandName,
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    locale: "en_US",
    siteName: brandName,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: brandName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": logoId,
        url: logo.url,
        contentUrl: logo.url,
        width: logo.width,
        height: logo.height,
        caption: logo.alt,
      },
      image: { "@id": logoId },
      parentOrganization: {
        "@type": "Organization",
        name: parentBrandName,
        url: parentBrandUrl,
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: `${brandName} LLM Wiki`,
      alternateName: [brandName, "Walnut llm-wiki"],
      url: siteUrl,
      description,
      publisher: { "@id": organizationId },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": softwareId,
      name: brandName,
      applicationCategory: "KnowledgeManagementApplication",
      operatingSystem: "macOS, Windows",
      description,
      url: siteUrl,
      image: ogImage.url,
      author: { "@id": organizationId },
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
} as const;

export const structuredDataJson = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c"
);
