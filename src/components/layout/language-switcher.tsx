"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { LOCALE_LABELS, type Locale } from "@/i18n/config"
import { setLocaleAction } from "@/i18n/actions"
import { useI18n } from "@/i18n/client"

const OTHER_LOCALE: Record<Locale, Locale> = { en: "th", th: "en" }

export function LanguageSwitcher() {
  const { locale, t } = useI18n()
  const [isPending, startTransition] = useTransition()
  const nextLocale = OTHER_LOCALE[locale]

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={`${t.common.language}: ${LOCALE_LABELS[nextLocale]}`}
      disabled={isPending}
      onClick={() => startTransition(() => setLocaleAction(nextLocale))}
    >
      {/** ปุ่มแสดงภาษาที่จะเปลี่ยนไปเมื่อกด เช่น TH หมายถึงเปลี่ยนเป็นไทย
 * The button shows the language it will switch to; TH means switch to Thai.
 */}
      <span className="text-xs font-semibold">{nextLocale.toUpperCase()}</span>
    </Button>
  )
}
