"use client"

import { createContext, useContext } from "react"

import type { Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

interface I18nValue {
  locale: Locale
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * The dictionary is resolved on the server and handed down as a plain object,
 * so client components read translations without shipping every locale's
 * strings to the browser.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={{ locale, t: dictionary }}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within <I18nProvider>")
  return context
}

/** Shorthand for the common case: `const t = useTranslations()`. */
export function useTranslations(): Dictionary {
  return useI18n().t
}
