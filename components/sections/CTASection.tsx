"use client";

import { useReducedMotion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import BrainLogo from "../effects/BrainLogo";
import AgentFooter from "../AgentFooter";
import { useI18n } from "@/lib/i18n/context";
import {
  WALNUT_DOWNLOAD_MANIFEST_URL,
  WALNUT_DOWNLOAD_STATS_URL,
} from "@/lib/downloads/config";

export default function CTASection() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="cta" className="landing-section overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-neural rounded-full opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <BrainLogo className="w-14 h-14 mx-auto mb-8 opacity-50" />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.055em] text-text-primary mb-6 leading-[0.98] text-balance">
            {t("cta.title1")}
            <br />
            <span className="gradient-text">{t("cta.title2")}</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="section-copy max-w-xl mx-auto mb-10">
            {t("cta.description")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#pricing"
              className="primary-cta px-8 py-3.5 rounded-full text-white text-sm font-medium transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#pricing")?.scrollIntoView({
                  behavior: shouldReduceMotion ? "auto" : "smooth",
                });
              }}
            >
              <span className="relative z-10">{t("brand.cta.pricing")}</span>
            </a>
          </div>
        </ScrollReveal>

        {/* Footer — Agent by evofarm series */}
        <ScrollReveal delay={0.4}>
          <AgentFooter
            agentName="Walnut"
            agentTagline={t("brand.subtitle")}
            repoOwner="lamwimham"
            repoName="walnut-releases"
            downloadLabel={t("cta.downloadLabel")}
            mirrorManifestUrl={WALNUT_DOWNLOAD_MANIFEST_URL}
            downloadStatsUrl={WALNUT_DOWNLOAD_STATS_URL}
            feedbackEmail="lianwimham@gmail.com"
            feedbackLabel={t("cta.feedback.label")}
            feedbackSubject={t("cta.feedback.subject")}
            resourceLinks={[{ href: "/llms.txt", label: t("cta.footer.llms") }]}
            badges={[
              t("cta.footer.local"),
              t("cta.footer.open"),
              t("cta.footer.sovereignty"),
            ]}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
