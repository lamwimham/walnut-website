"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import BrainLogo from "./effects/BrainLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

const NAV_ITEMS = [
  { key: "philosophy", href: "#philosophy" },
  { key: "problem", href: "#problem" },
  { key: "features", href: "#features" },
  { key: "demo", href: "#demo" },
  { key: "taste", href: "#taste" },
  { key: "pricing", href: "#pricing" },
];

const LLM_RESOURCE_LINK = { key: "llms", href: "/llms.txt" } as const;

export default function StickyHeader() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      <motion.header
        initial={shouldReduceMotion ? false : { y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[rgba(8,8,15,0.88)] backdrop-blur-xl border-b border-border-subtle"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 group"
          >
            <BrainLogo className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-sm tracking-[0.2em] uppercase text-neural-soft font-medium">
              {t("brand.name")}
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.href)}
                className="px-3 py-1.5 text-xs tracking-wider text-text-muted hover:text-neural-soft transition-colors duration-300 rounded-lg hover:bg-[rgba(200,192,255,0.06)]"
              >
                {t(`nav.${item.key}`)}
              </button>
            ))}
          </nav>

          {/* Right: Language + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href={LLM_RESOURCE_LINK.href}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-[rgba(12,12,18,0.8)] px-2.5 py-1.5 text-xs tracking-[0.16em] text-text-secondary backdrop-blur-sm transition-colors duration-300 hover:border-neural-soft/45 hover:text-neural-soft"
              aria-label={t(`nav.${LLM_RESOURCE_LINK.key}`)}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-signal/80 shadow-[0_0_12px_rgba(79,209,197,0.55)] transition-transform duration-300 group-hover:scale-125" />
              <span>LLMs</span>
              <span className="hidden sm:inline">.txt</span>
            </a>
            <LanguageSwitcher />
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
              aria-label="Toggle menu"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-4 h-px bg-text-muted"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-4 h-px bg-text-muted"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-4 h-px bg-text-muted"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-[rgba(8,8,15,0.6)] backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              id="mobile-navigation"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden bg-[rgba(8,8,15,0.95)] backdrop-blur-xl border-b border-border-subtle px-6 py-4"
            >
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.key}
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleNavClick(item.href)}
                    className="text-left px-4 py-3 text-sm text-text-muted hover:text-neural-soft hover:bg-[rgba(200,192,255,0.06)] rounded-lg transition-colors duration-200"
                  >
                    {t(`nav.${item.key}`)}
                  </motion.button>
                ))}

              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
