"use client"

import { createContext, useContext } from "react"

import type { Locale } from "./config"
import type { Dictionary } from "./dictionaries/en"

interface I18nValue {
  locale: Locale
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

/** เซิร์ฟเวอร์ส่งเฉพาะคำแปลภาษาที่เลือกให้หน้าจอ เพื่อไม่ต้องโหลดทุกภาษา
 * Send only the selected dictionary from the server to client components.
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
  if (!context) throw new Error("เรียก useI18n ภายใน I18nProvider / Use useI18n inside I18nProvider.")
  return context
}

/** เรียก useTranslations() เมื่อต้องการอ่านข้อความที่แปลแล้ว
 * Use useTranslations() to access the current translated messages.
 */
export function useTranslations(): Dictionary {
  return useI18n().t
}
