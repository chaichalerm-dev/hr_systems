import "server-only"

import { cookies } from "next/headers"

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config"
import { en, type Dictionary } from "./dictionaries/en"
import { th } from "./dictionaries/th"

const DICTIONARIES: Record<Locale, Dictionary> = { en, th }

/** Reads the viewer's locale from the cookie the language switcher sets. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

/** Dictionary for the current locale. Use in server components: `const t = await getDictionary()`. */
export async function getDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()]
}

export function getDictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
