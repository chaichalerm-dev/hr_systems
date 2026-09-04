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
      variant="ghost"
      size="icon"
      aria-label={`${t.common.language}: ${LOCALE_LABELS[nextLocale]}`}
      disabled={isPending}
      onClick={() => startTransition(() => setLocaleAction(nextLocale))}
    >
      {/* Shows the language you'll switch TO, not the current one — the
          standard convention for a two-way toggle with only two options. */}
      <span className="text-xs font-semibold">{nextLocale.toUpperCase()}</span>
    </Button>
  )
}
