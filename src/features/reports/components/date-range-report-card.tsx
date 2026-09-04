"use client"

import { useState } from "react"
import { format, startOfMonth } from "date-fns"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/i18n/client"

export function DateRangeReportCard({
  title,
  description,
  endpoint,
}: {
  title: string
  description: string
  endpoint: string
}) {
  const t = useTranslations()
  const today = new Date()
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"))
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"))

  const href = `${endpoint}?from=${from}&to=${to}`

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">{t.reports.from}</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.reports.to}</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <Button className="mt-4 w-full" nativeButton={false} render={<a href={href} />}>
        <Download className="size-4" />
        {t.common.export}
      </Button>
    </div>
  )
}
