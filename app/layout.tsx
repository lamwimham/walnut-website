import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walnut — The Foundation of Your Future Personal Agent",
  description: "Walnut is your llm-wiki. Memory to AI, index to yourself. Taste cannot be copied. Soul accumulates over time. Walnut is not a knowledge base — it is the unique personality training dataset for your future personal Agent.",
  keywords: ["Walnut", "llm-wiki", "second brain", "personal Agent", "knowledge management", "AI", "indexing", "soul data"],
  authors: [{ name: "Walnut" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Walnut — The Foundation of Your Future Personal Agent",
    description: "Walnut is your llm-wiki. Memory to AI, index to yourself. Taste cannot be copied. Soul accumulates over time. Walnut is not a knowledge base — it is the unique personality training dataset for your future personal Agent.",
    type: "website",
    locale: "en_US",
    siteName: "Walnut",
    images: [{
      url: "https://walnut.evofarm.top/og-image.png",
      width: 1200,
      height: 630,
      alt: "Walnut — The Foundation of Your Future Personal Agent",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Walnut — The Foundation of Your Future Personal Agent",
    description: "Walnut is your llm-wiki. Memory to AI, index to yourself. Taste cannot be copied. Soul accumulates over time. Walnut is not a knowledge base — it is the unique personality training dataset for your future personal Agent.",
    images: ["https://walnut.evofarm.top/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://walnut.evofarm.top/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Walnut",
  applicationCategory: "KnowledgeManagementApplication",
  operatingSystem: "macOS, Windows",
  description: "Walnut is your llm-wiki. Memory to AI, index to yourself. Taste cannot be copied. Soul accumulates over time. Walnut is not a knowledge base — it is the unique personality training dataset for your future personal Agent.",
  url: "https://walnut.evofarm.top/",
  image: "https://walnut.evofarm.top/og-image.png",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "EvoFarm",
    url: "https://www.evofarm.top",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-bg-deep text-text-primary overflow-x-hidden">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
