"use client";

import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

const LAYER_KEYS = ["soul", "persona", "vision", "philosophy", "function", "pain"] as const;
const LAYER_ICONS = ["◆", "◈", "◉", "◎", "○", "◯"];
const LAYER_COLORS = [
  "var(--soul)",
  "var(--neural-soft)",
  "var(--neural)",
  "var(--signal)",
  "rgba(200, 192, 255, 0.72)",
  "rgba(184, 181, 199, 0.62)",
];

export default function PhilosophyPyramid() {
  const { t } = useI18n();

  return (
    <section id="philosophy" className="landing-section">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-kicker">
              {t("philosophy.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("philosophy.title")}
            </h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("philosophy.description")}
            </p>
          </div>
        </ScrollReveal>

        {/* Cards grid - equal width */}
        <div className="flex flex-col gap-3">
          {LAYER_KEYS.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.08}>
              <motion.div
                className="relative group cursor-default w-full"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="surface-card philosophy-card relative rounded-xl p-5 md:p-6 transition-all duration-300 group-hover:border-[rgba(213,180,106,0.28)]"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="text-lg mt-0.5 flex-shrink-0"
                      style={{ color: LAYER_COLORS[i] }}
                    >
                      {LAYER_ICONS[i]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="text-[10px] tracking-[0.2em] uppercase font-medium"
                          style={{ color: LAYER_COLORS[i] }}
                        >
                          {t(`philosophy.layers.${key}.level`)}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                        {t(`philosophy.layers.${key}.title`)}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {t(`philosophy.layers.${key}.desc`)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
