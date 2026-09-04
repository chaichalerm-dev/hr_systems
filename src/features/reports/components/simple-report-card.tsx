"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/client"

export function SimpleReportCard({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const t = useTranslations()

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <Button className="mt-4 w-full" nativeButton={false} render={<a href={endpoint} />}>
        <Download className="size-4" />
        {t.common.export}
      </Button>
    </div>
  )
}
