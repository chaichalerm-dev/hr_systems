"use client"

import { useLinkStatus } from "next/link"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/client"

export function LinkPending() {
  const { pending } = useLinkStatus()
  const t = useTranslations()
  if (!pending) return null
  return (
    <span role="status" className="absolute right-1 rounded-full bg-inherit p-1">
      <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
      <span className="sr-only">{t.common.loading}</span>
    </span>
  )
}
