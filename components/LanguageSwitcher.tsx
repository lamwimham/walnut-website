"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleSwitch = (newLocale: Locale) => {
    setLocale(newLocale);
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-wider text-text-secondary border border-border-subtle hover:border-border-strong hover:text-neural-soft transition-colors duration-300 bg-[rgba(12,12,18,0.8)] backdrop-blur-sm"
        whileTap={{ scale: 0.95 }}
        aria-label={t("lang.switch")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="text-neural-soft">{LOCALE_LABELS[locale]}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 z-50 py-1.5 rounded-xl border border-border-subtle bg-bg-elevated backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[100px]"
            >
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleSwitch(l)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    locale === l
                      ? "text-neural-soft bg-[rgba(124,104,245,0.1)]"
                      : "text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
