"use client";

import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

const PHASE_KEYS = ["phase1", "phase2", "phase3"] as const;
const PHASE_FEATURE_KEYS: Record<string, string[]> = {
  phase1: ["entity", "link", "conflict"],
  phase2: ["editor", "paste"],
  phase3: ["graph", "orphan"],
};

export default function FeatureRadar() {
  const { t } = useI18n();

  return (
    <section id="features" className="landing-section">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="section-kicker">
              {t("features.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("features.title")}
            </h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("features.description")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {PHASE_KEYS.map((phase, i) => (
            <ScrollReveal key={phase} delay={i * 0.12}>
              <motion.div
                className="surface-card phase-card rounded-2xl p-6 transition-all duration-300"
                whileHover={{ y: -2 }}
              >
                <div className="mb-6">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-neural-soft mb-2 block">
                    {t(`features.phases.${phase}.subtitle`)}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-text-primary">
                    {t(`features.phases.${phase}.name`)}
                  </h3>
                  <p className="text-sm text-text-muted mt-3 leading-relaxed">
                    {t(`features.phases.${phase}.desc`)}
                  </p>
                </div>

                <div className="space-y-4">
                  {PHASE_FEATURE_KEYS[phase].map((feat) => (
                    <div key={feat} className="group">
                      <div className="text-sm font-medium text-text-secondary mb-1">
                        {t(`features.phases.${phase}.features.${feat}.name`)}
                      </div>
                      <div className="text-xs text-text-muted leading-relaxed">
                        {t(`features.phases.${phase}.features.${feat}.desc`)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
