import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/context";
import { siteMetadata, structuredDataJson } from "@/lib/seo/site";
import "./globals.css";
import "./account.css";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="text/markdown"
          href="/llms.txt"
          title="LLMs.txt"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredDataJson }}
        />
      </head>
      <body className="min-h-full bg-bg-deep text-text-primary overflow-x-hidden">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
