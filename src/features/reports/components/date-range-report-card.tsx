"use client"

import { useId, useState } from "react"
import { format, startOfMonth } from "date-fns"
import { Download, FileBarChart } from "lucide-react"

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
  const id = useId()
  const today = new Date()
  const [from, setFrom] = useState(format(startOfMonth(today), "yyyy-MM-dd"))
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"))

  const href = `${endpoint}?from=${from}&to=${to}`
  const validRange = Boolean(from && to && from <= to)

  return (
    <div className="flex flex-col items-start rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileBarChart className="size-5" /></div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-5 grid w-full grid-cols-1 gap-3 min-[400px]:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-from`} className="text-xs">{t.reports.from}</Label>
          <Input id={`${id}-from`} type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-to`} className="text-xs">{t.reports.to}</Label>
          <Input id={`${id}-to`} type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      {!validRange && <p role="alert" className="mt-3 text-sm text-destructive">{t.workspace.invalidDates}</p>}
      <Button className="mt-5 w-full" disabled={!validRange} nativeButton={false} render={<a href={validRange ? href : undefined} />}>
        <Download className="size-4" />
        {t.common.export}
      </Button>
    </div>
  )
}
