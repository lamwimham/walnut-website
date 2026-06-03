export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["zh", "en"];

export const LOCALE_NAMES: Record<Locale, string> = {
  zh: "中文",
  en: "English",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "中",
  en: "EN",
};
