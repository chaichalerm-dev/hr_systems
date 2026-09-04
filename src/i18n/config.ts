export const LOCALES = ["en", "th"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "hrflow_locale"

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}
