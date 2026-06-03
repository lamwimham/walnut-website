"use client";

import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

const METRIC_KEYS = ["tech", "indie", "business", "humanities", "other"];
const METRIC_COLORS = [
  "var(--neural)",
  "var(--soul)",
  "var(--signal)",
  "var(--neural-soft)",
  "rgba(184, 181, 199, 0.74)",
];
const METRIC_VALUES = [40, 28, 16, 8, 8];

const SOUL_DATA_KEYS = ["collect", "review", "edit", "link", "ignore", "question"] as const;
const SOUL_DATA_ICONS = ["★", "↻", "✎", "⇄", "✕", "?"];

export default function TasteProfile() {
  const { t } = useI18n();

  return (
    <section id="taste" className="landing-section">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-20">
            <span className="section-kicker">
              {t("taste.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("taste.title")}
            </h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("taste.description")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Chart */}
          <ScrollReveal>
            <div className="surface-card fingerprint-panel rounded-2xl p-8">
              <h3 className="text-sm font-medium text-text-secondary mb-8">{t("taste.chartTitle")}</h3>
              <div className="space-y-4">
                {METRIC_KEYS.map((key, i) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-muted">{t(`taste.metrics.${key}`)}</span>
                      <span className="text-text-muted">{METRIC_VALUES[i]}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(200,192,255,0.08)] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: METRIC_COLORS[i] }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${METRIC_VALUES[i]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-text-muted mt-6">{t("taste.chartNote")}</p>
            </div>
          </ScrollReveal>

          {/* Soul Data */}
          <ScrollReveal delay={0.1}>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-6">{t("taste.soulDataTitle")}</h3>
              <div className="space-y-3">
                {SOUL_DATA_KEYS.map((key, i) => (
                  <motion.div
                    key={key}
                    className="surface-card flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-soul text-sm mt-0.5">{SOUL_DATA_ICONS[i]}</span>
                    <div>
                      <div className="text-sm font-medium text-text-secondary mb-0.5">
                        {t(`taste.soulDataTypes.${key}.label`)}
                      </div>
                      <div className="text-xs text-text-muted">
                        {t(`taste.soulDataTypes.${key}.desc`)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-16 text-center">
            <p className="font-display text-lg text-text-secondary italic">“{t("taste.quote")}”</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
