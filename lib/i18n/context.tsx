"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";
import { type Locale, DEFAULT_LOCALE, LOCALES } from "./config";
import { translations } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isZh: boolean;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const LOCALE_STORAGE_KEY = "walnut-locale";
const LOCALE_CHANGE_EVENT = "walnut-locale-change";

function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) return stored;
  }
  return DEFAULT_LOCALE;
}

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_CHANGE_EVENT, callback);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getInitialLocale,
    () => DEFAULT_LOCALE
  );

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale === "zh" ? "zh-CN" : "en";
      window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const currentTranslations = translations[locale];
      let value = getNestedValue(currentTranslations, key);

      if (value === undefined) {
        const fallbackTranslations = translations[DEFAULT_LOCALE];
        value = getNestedValue(fallbackTranslations, key);
      }

      if (value === undefined) {
        return key;
      }

      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_match, paramKey) => {
          const paramValue = params[paramKey];
          return paramValue !== undefined ? String(paramValue) : `{{${paramKey}}}`;
        });
      }

      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isZh: locale === "zh",
        isEn: locale === "en",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
