"use client"

import { Download, FileBarChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/client"

export function SimpleReportCard({ title, description, endpoint }: { title: string; description: string; endpoint: string }) {
  const t = useTranslations()

  return (
    // ไอคอนอยู่ข้างหัวข้อแทนที่จะแยกไว้บนสุด กันการ์ดสูงเกินจำเป็นบนมือถือ
    // The icon sits beside the heading instead of on its own line above it, so the card isn't taller than it needs to be on mobile.
    <div className="flex flex-col items-start rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-11"><FileBarChart className="size-4.5 sm:size-5" /></div>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Button className="mt-4 w-full" nativeButton={false} render={<a href={endpoint} />}>
        <Download className="size-4" />
        {t.common.export}
      </Button>
    </div>
  )
}
