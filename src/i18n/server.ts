import "server-only"

import { cookies } from "next/headers"

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config"
import { en, type Dictionary } from "./dictionaries/en"
import { th } from "./dictionaries/th"

const DICTIONARIES: Record<Locale, Dictionary> = { en, th }

/** อ่านภาษาจากคุกกี้ที่ปุ่มสลับภาษาบันทึกไว้
 * Read the language cookie saved by the language switcher.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

/** ใน Server Component ใช้ const t = await getDictionary() เพื่ออ่านคำแปล
 * Use const t = await getDictionary() in a Server Component.
 */
export async function getDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()]
}

export function getDictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}
