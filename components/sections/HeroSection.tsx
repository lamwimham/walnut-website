"use client";

import { motion, useReducedMotion } from "framer-motion";
import BrainLogo from "../effects/BrainLogo";
import DownloadButtons from "../DownloadButtons";
import { WALNUT_DOWNLOAD_MANIFEST_URL } from "@/lib/downloads/config";
import { useI18n } from "@/lib/i18n/context";

export default function HeroSection() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      {/* Radial vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50" />

      {/* Content */}
      <div className="z-10 flex flex-col items-center text-center max-w-5xl mx-auto pb-24 md:pb-28">
        {/* Brain Logo */}
        <motion.div
          className="mb-8 md:mb-10"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.2 }}
        >
          <BrainLogo className="w-20 h-20 md:w-28 md:h-28 mx-auto" />
        </motion.div>

        {/* Brand name */}
        <motion.div
          className="mb-7"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.5 }}
        >
          <span className="section-kicker text-[0.68rem]">
            {t("brand.name")}
          </span>
        </motion.div>

        {/* Main title: Memory to AI */}
        <motion.div
          className="mb-2"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.7 }}
        >
          <h1 className="font-display text-[clamp(3rem,9vw,7.8rem)] font-semibold tracking-[-0.07em] leading-[0.92] text-balance">
            <span className="text-text-primary">{t("hero.title1")}</span>
            <span className="text-text-muted">{t("hero.title2")}</span>
            <span className="gradient-text">{t("hero.title3")}</span>
          </h1>
        </motion.div>

        {/* Subtitle: Index for Yourself */}
        <motion.div
          className="mb-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 0.9 }}
        >
          <h2 className="font-display text-[clamp(3rem,9vw,7.8rem)] font-semibold tracking-[-0.07em] leading-[0.92] text-balance">
            <span className="text-text-secondary">{t("hero.subtitle1")}</span>
            <span className="text-text-muted">{t("hero.subtitle2")}</span>
            <span className="gradient-text">{t("hero.subtitle3")}</span>
          </h2>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="mb-12"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 1.1 }}
        >
          <p className="text-sm text-text-muted tracking-[0.15em] max-w-md mx-auto leading-relaxed">
            {t("brand.tagline")}
          </p>
        </motion.div>

        {/* Download Buttons — primary CTA */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 1.3 }}
        >
          <DownloadButtons
            repoOwner="lamwimham"
            repoName="walnut-releases"
            productName="Walnut"
            fallbackLabel={t("downloads.latestProduct", { productName: "Walnut" })}
            mirrorManifestUrl={WALNUT_DOWNLOAD_MANIFEST_URL}
            className="justify-center"
          />
        </motion.div>

        {/* Secondary CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mt-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1, delay: shouldReduceMotion ? 0 : 1.5 }}
        >
          <motion.a
            href="#philosophy"
            className="secondary-cta group px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#philosophy")?.scrollIntoView({
                behavior: shouldReduceMotion ? "auto" : "smooth",
              });
            }}
          >
            <span className="relative z-10">{t("brand.cta.explore")}</span>
          </motion.a>

          <a
            href="#pricing"
            className="flex items-center text-sm text-text-muted hover:text-neural-soft transition-colors px-4 py-3"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#pricing")?.scrollIntoView({
                behavior: shouldReduceMotion ? "auto" : "smooth",
              });
            }}
          >
            {t("brand.cta.pricing")} →
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator — positioned at section level to avoid overlapping content */}
      <motion.div
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-10"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 2, duration: shouldReduceMotion ? 0 : 1 }}
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-border-subtle flex items-start justify-center p-1.5"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-neural"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
