"use client";

import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "../effects/ScrollReveal";
import { useI18n } from "@/lib/i18n/context";
import { useState, useRef, useEffect } from "react";

export default function DemoSection() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => setVideoError(true);
    video.addEventListener("error", handleError);

    // Also catch source-specific errors
    const sources = video.querySelectorAll("source");
    sources.forEach((source) =>
      source.addEventListener("error", handleError)
    );

    return () => {
      video.removeEventListener("error", handleError);
      sources.forEach((source) =>
        source.removeEventListener("error", handleError)
      );
    };
  }, []);

  return (
    <section id="demo" className="landing-section">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="section-kicker">{t("demo.label")}</span>
            <h2 className="section-title mb-6">{t("demo.title")}</h2>
            <p className="section-copy max-w-xl mx-auto">
              {t("demo.description")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <motion.div
            className="relative mx-auto"
            style={{ perspective: 1200 }}
            initial={
              shouldReduceMotion
                ? false
                : { rotateX: 6, y: 50, opacity: 0.8 }
            }
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: shouldReduceMotion ? 0 : 1.1,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {/* Browser chrome */}
            <div className="surface-card rounded-2xl overflow-hidden border border-border-subtle shadow-[0_28px_90px_rgba(54,44,132,0.18)]">
              {/* Title bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle bg-[rgba(255,255,255,0.02)]">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-md bg-[rgba(255,255,255,0.04)] text-xs text-text-muted tracking-wide border border-border-subtle/50">
                    walnut.app
                  </div>
                </div>
                <div className="w-14" />
              </div>

              {/* Content area */}
              <div className="relative bg-bg-deep">
                {/* Video layer */}
                <video
                  ref={videoRef}
                  className={`w-full aspect-[16/10] object-cover ${
                    videoError ? "hidden" : "block"
                  }`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>

                {/* Fallback mockup UI */}
                {videoError && (
                  <div className="w-full aspect-[16/10] p-6 md:p-8">
                    <div className="w-full h-full grid grid-cols-12 gap-3 md:gap-4">
                      {/* Sidebar */}
                      <div className="col-span-3 rounded-xl bg-bg-surface border border-border-subtle p-3 md:p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-neural/20 flex items-center justify-center text-[10px] text-neural-soft">
                            🧠
                          </div>
                          <div className="h-2.5 w-12 md:w-16 bg-text-muted/20 rounded" />
                        </div>
                        <div className="space-y-2.5">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2"
                            >
                              <div className="w-3.5 h-3.5 rounded bg-text-muted/10" />
                              <div
                                className={`h-2 bg-text-muted/10 rounded ${
                                  i === 0
                                    ? "w-3/4"
                                    : i === 2
                                    ? "w-2/3"
                                    : "w-full"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto pt-4">
                          <div className="h-16 rounded-lg bg-neural-dim/50 border border-neural/10 p-2">
                            <div className="h-1.5 bg-neural-soft/20 rounded w-2/3 mb-2" />
                            <div className="h-1 bg-text-muted/10 rounded w-full" />
                          </div>
                        </div>
                      </div>

                      {/* Main editor */}
                      <div className="col-span-6 rounded-xl bg-bg-surface border border-border-subtle p-3 md:p-5 flex flex-col gap-3">
                        <div className="h-3 bg-text-muted/20 rounded w-1/2" />
                        <div className="space-y-2">
                          <div className="h-2 bg-text-muted/10 rounded w-full" />
                          <div className="h-2 bg-text-muted/10 rounded w-5/6" />
                          <div className="h-2 bg-text-muted/10 rounded w-4/5" />
                        </div>
                        <div className="mt-2 p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-signal" />
                            <div className="h-2 bg-signal/30 rounded w-20" />
                          </div>
                          <div className="h-2 bg-text-muted/10 rounded w-full mb-1" />
                          <div className="h-2 bg-text-muted/10 rounded w-3/4" />
                        </div>
                        <div className="mt-auto grid grid-cols-3 gap-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="h-12 rounded-lg bg-bg-elevated border border-border-subtle"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Context panel */}
                      <div className="col-span-3 rounded-xl bg-bg-surface border border-border-subtle p-3 md:p-4 flex flex-col gap-3">
                        <div className="h-2.5 bg-text-muted/20 rounded w-2/3" />
                        <div className="space-y-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-neural/40 mt-1" />
                              <div className="flex-1 space-y-1">
                                <div className="h-2 bg-text-muted/15 rounded w-full" />
                                <div className="h-1.5 bg-text-muted/10 rounded w-4/5" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto p-2.5 rounded-lg bg-soul/5 border border-soul/10">
                          <div className="h-2 bg-soul/30 rounded w-1/2 mb-2" />
                          <div className="h-1.5 bg-text-muted/10 rounded w-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ambient glow behind */}
            <div className="absolute -inset-6 bg-gradient-to-b from-neural-dim to-transparent rounded-[2.5rem] blur-3xl -z-10 opacity-25 pointer-events-none" />
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
