"use client"

import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/client"

export function PageLoading() {
  const t = useTranslations()
  return (
    <div data-page-loading className="space-y-6" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />
        {t.common.loading}
      </p>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 rounded-xl border bg-card" />)}
        </div>
        <div className="space-y-5 rounded-xl border bg-card p-6">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-5 rounded-md bg-muted" />)}
        </div>
      </div>
    </div>
  )
}
