"use client";

import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

const COMPARISON_KEYS = ["metaphor", "interaction", "value"] as const;

export default function ProblemSection() {
  const { t } = useI18n();

  return (
    <section id="problem" className="landing-section">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="section-kicker">
              {t("problem.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("problem.title")}
            </h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("problem.description")}
            </p>
          </div>
        </ScrollReveal>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {COMPARISON_KEYS.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <motion.div
                className="surface-card rounded-2xl p-6 transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                <div className="mb-6">
                  <div className="text-xs text-text-muted mb-2">
                    {t(`problem.comparisons.${key}.traditional`)}
                  </div>
                  <div className="text-sm text-text-muted">
                    {t(`problem.comparisons.${key}.traditionalDesc`)}
                  </div>
                </div>

                <div className="hairline-divider mb-6" />

                <div>
                  <div className="text-xs text-neural-soft mb-2 font-medium">
                    {t(`problem.comparisons.${key}.sage`)}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {t(`problem.comparisons.${key}.sageDesc`)}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* AI vs Human */}
        <div className="grid md:grid-cols-2 gap-6">
          <ScrollReveal>
            <div className="surface-card rounded-2xl p-8">
              <span className="text-[10px] tracking-[0.2em] uppercase text-neural-soft mb-3 block">
                {t("problem.aiRole.label")}
              </span>
              <h3 className="font-display text-3xl font-semibold text-text-primary mb-3">{t("problem.aiRole.title")}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t("problem.aiRole.desc")}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="surface-card-quiet rounded-2xl p-8">
              <span className="text-[10px] tracking-[0.2em] uppercase text-text-muted mb-3 block">
                {t("problem.humanRole.label")}
              </span>
              <h3 className="font-display text-3xl font-semibold text-text-primary mb-3">{t("problem.humanRole.title")}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{t("problem.humanRole.desc")}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
