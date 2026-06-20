"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

type PricingPlanKey = "free" | "proByok" | "lifetime";
type PricingTone = "quiet" | "featured" | "lifetime";

interface PricingPlanConfig {
  key: PricingPlanKey;
  featureCount: number;
  tagCount: number;
  tone: PricingTone;
}

const selectionGuides = [
  "software",
  "ownAi",
  "hostedLater",
] as const;

const pricingPlans: PricingPlanConfig[] = [
  {
    key: "free",
    featureCount: 5,
    tagCount: 2,
    tone: "quiet",
  },
  {
    key: "proByok",
    featureCount: 6,
    tagCount: 3,
    tone: "featured",
  },
  {
    key: "lifetime",
    featureCount: 6,
    tagCount: 3,
    tone: "lifetime",
  },
];

const toneClasses: Record<PricingTone, string> = {
  quiet: "surface-card-quiet",
  featured: "pricing-card-featured surface-card bg-[rgba(124,104,245,0.055)]",
  lifetime: "pricing-card-lifetime surface-card bg-[rgba(213,180,106,0.035)]",
};

const ctaClasses: Record<PricingTone, string> = {
  quiet: "secondary-cta",
  featured: "primary-cta text-white",
  lifetime: "lifetime-cta",
};

function scrollToCTA(event: MouseEvent<HTMLAnchorElement>, behavior: ScrollBehavior) {
  event.preventDefault();
  document.querySelector("#cta")?.scrollIntoView({ behavior });
}

export default function PricingSection() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="landing-section overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="section-kicker">
              {t("pricing.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("pricing.title")}
            </h2>
            <p className="section-copy max-w-2xl mx-auto">
              {t("pricing.description")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="pricing-rail max-w-4xl mx-auto mb-10 rounded-[1.7rem] px-5 py-4 md:px-6">
            <div className="grid gap-3 md:grid-cols-3">
              {selectionGuides.map((guide) => (
                <div key={guide} className="rounded-2xl border border-border-subtle bg-white/[0.025] px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.24em] text-neural-soft">
                    {t(`pricing.selectionGuides.${guide}.label`)}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {t(`pricing.selectionGuides.${guide}.value`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-3xl mx-auto mb-12">
            <div className="rounded-xl border border-signal/20 bg-signal/5 px-5 py-3 text-center">
              <p className="text-sm text-soul">
                {t("pricing.betaNotice")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {pricingPlans.map((plan, i) => {
            const isFeatured = plan.tone === "featured";

            return (
              <ScrollReveal key={plan.key} delay={0.15 + i * 0.08} className="h-full">
                <motion.div
                  className={`pricing-card relative flex h-full flex-col rounded-2xl p-6 overflow-visible ${toneClasses[plan.tone]}`}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 flex min-h-[11rem] flex-col">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      {Array.from({ length: plan.tagCount }).map((_, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="rounded-full border border-border-subtle bg-white/[0.025] px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-text-muted"
                        >
                          {t(`pricing.${plan.key}.tags.${tagIndex}`)}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-text-primary mb-2 flex flex-wrap items-center gap-2">
                      <span>{t(`pricing.${plan.key}.name`)}</span>
                      {isFeatured && (
                        <span className="inline-flex items-center rounded-full border border-neural-soft/25 bg-neural-dim px-2.5 py-1 font-body text-[0.62rem] font-bold uppercase tracking-[0.18em] text-neural-soft">
                          {t("pricing.featuredBadge")}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`pricing.${plan.key}.subtitle`)}
                    </p>
                  </div>

                  <div className="mb-7 min-h-[7.5rem] rounded-2xl border border-white/[0.055] bg-black/[0.14] p-4">
                    <div className="flex items-end gap-1">
                      <span className={`font-display text-5xl font-semibold ${plan.tone === "lifetime" ? "text-soul" : "text-text-primary"}`}>
                        {t(`pricing.${plan.key}.price`)}
                      </span>
                      <span className="pb-2 text-sm text-text-muted">
                        {t(`pricing.${plan.key}.period`)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-soul">
                      {t(`pricing.${plan.key}.allowance`)}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {Array.from({ length: plan.featureCount }).map((_, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                        <svg
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.tone === "lifetime" ? "text-soul" : "text-neural-soft"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t(`pricing.${plan.key}.features.${featureIndex}`)}
                      </li>
                    ))}
                  </ul>

                  <motion.a
                    href="#cta"
                    onClick={(event) => scrollToCTA(event, shouldReduceMotion ? "auto" : "smooth")}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-medium transition-all duration-300 ${ctaClasses[plan.tone]}`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">
                      {t(`pricing.${plan.key}.cta`)}
                    </span>
                  </motion.a>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.4}>
          <p className="text-center text-xs text-text-muted mt-10 max-w-2xl mx-auto leading-relaxed">
            {t("pricing.note")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
