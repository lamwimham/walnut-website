"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

export default function PricingSection() {
  const { t, isZh } = useI18n();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      key: "subscription",
      featured: true,
    },
    {
      key: "bringYourOwn",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="landing-section">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8">
            <span className="section-kicker">
              {t("pricing.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("pricing.title")}
            </h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("pricing.description")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="rounded-xl border border-signal/20 bg-signal/5 px-5 py-3 text-center">
              <p className="text-sm text-soul">
                {t("pricing.betaNotice")}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal delay={0.1}>
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 p-1 rounded-full bg-[rgba(200,192,255,0.06)] border border-border-subtle">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                aria-pressed={!isYearly}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  !isYearly
                    ? "bg-[rgba(124,104,245,0.18)] text-neural-soft"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                aria-pressed={isYearly}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                  isYearly
                    ? "bg-[rgba(124,104,245,0.18)] text-neural-soft"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t("pricing.yearly")}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(213,180,106,0.16)] text-soul">
                  {t("pricing.save")}
                </span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => {
            const isFeatured = plan.featured;
            const price = isYearly
              ? t(`pricing.${plan.key}.priceYearly`)
              : t(`pricing.${plan.key}.priceMonthly`);
            const period = isYearly
              ? t(`pricing.${plan.key}.periodYearly`)
              : t(`pricing.${plan.key}.periodMonthly`);

            return (
              <ScrollReveal key={plan.key} delay={0.15 + i * 0.1}>
                <motion.div
                  className={`pricing-card relative rounded-2xl p-8 overflow-visible ${
                    isFeatured
                      ? "pricing-card-featured surface-card bg-[rgba(124,104,245,0.04)]"
                      : "surface-card-quiet"
                  }`}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h3 className="font-display text-2xl font-semibold text-text-primary mb-1 flex items-center gap-2">
                      {t(`pricing.${plan.key}.name`)}
                      {isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase bg-signal text-bg-deep font-bold">
                          {t("pricing.betaBadge")}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {t(`pricing.${plan.key}.subtitle`)}
                    </p>
                  </div>

                  <div className="mb-8">
                    {price === "¥0" || price === "$0" ? (
                      <span className="font-display text-4xl font-semibold text-soul">
                        {isZh ? "永久免费" : "Free Forever"}
                      </span>
                    ) : (
                      <>
                        <span className="font-display text-5xl font-semibold text-text-primary">{price}</span>
                        <span className="text-text-muted ml-1">{period}</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {Array.from({ length: 6 }).map((_, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm text-text-secondary">
                        <svg
                          className="w-4 h-4 mt-0.5 flex-shrink-0 text-neural-soft"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {t(`pricing.${plan.key}.features.${fi}`)}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    type="button"
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isFeatured
                        ? "primary-cta text-white"
                        : "secondary-cta"
                    } block text-center`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">
                      {plan.key === "subscription"
                        ? t("pricing.subscription.betaCta")
                        : t(`pricing.${plan.key}.cta`)}
                    </span>
                  </motion.button>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={0.4}>
          <p className="text-center text-xs text-text-muted mt-10">
            {t("pricing.note")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
