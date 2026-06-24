"use client";

import { motion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";

const LOOP_KEYS = ["capture", "index", "connect", "review"] as const;
const PRINCIPLE_KEYS = ["ownership", "judgment", "agentReady"] as const;

export default function KnowledgeManagementSection() {
  const { t } = useI18n();

  return (
    <section id="knowledge-management" className="landing-section">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="max-w-3xl mb-16">
            <span className="section-kicker">
              {t("knowledgeManagement.label")}
            </span>
            <h2 className="section-title mb-6">
              {t("knowledgeManagement.title")}
            </h2>
            <p className="section-copy max-w-2xl">
              {t("knowledgeManagement.description")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.85fr]">
          <ScrollReveal delay={0.1}>
            <div className="knowledge-loop-panel rounded-3xl p-6 md:p-8">
              <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] text-text-primary">
                  {t("knowledgeManagement.loopTitle")}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                  Capture → Index → Connect → Review
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {LOOP_KEYS.map((key, index) => (
                  <motion.article
                    key={key}
                    className="knowledge-loop-card rounded-2xl p-5"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="font-display text-3xl font-semibold text-soul/80">
                        {t(`knowledgeManagement.loop.${key}.step`)}
                      </span>
                      <span className="h-px flex-1 mx-4 bg-gradient-to-r from-soul/30 to-transparent" />
                      <span className="h-2 w-2 rounded-full bg-neural-soft shadow-[0_0_18px_rgba(200,192,255,0.55)]" />
                    </div>
                    <h4 className="mb-2 text-lg font-semibold text-text-primary">
                      {t(`knowledgeManagement.loop.${key}.title`)}
                    </h4>
                    <p className="text-sm leading-relaxed text-text-muted">
                      {t(`knowledgeManagement.loop.${key}.desc`)}
                    </p>
                    <div className="mt-5 text-xs tracking-[0.18em] text-neural-soft/70">
                      {index < LOOP_KEYS.length - 1
                        ? "NEXT SIGNAL"
                        : "MEMORY LOOP"}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <aside className="surface-card knowledge-principles rounded-3xl p-6 md:p-8">
              <h3 className="mb-8 font-display text-2xl font-semibold tracking-[-0.035em] text-text-primary">
                {t("knowledgeManagement.principlesTitle")}
              </h3>
              <div className="space-y-6">
                {PRINCIPLE_KEYS.map((key) => (
                  <div key={key}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                      <h4 className="text-sm font-semibold text-text-secondary">
                        {t(`knowledgeManagement.principles.${key}.title`)}
                      </h4>
                    </div>
                    <p className="pl-4 text-sm leading-relaxed text-text-muted">
                      {t(`knowledgeManagement.principles.${key}.desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
