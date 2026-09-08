import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: "default" | "good" | "warning" | "critical"
  hint?: string
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    good: "bg-status-good/10 text-status-good",
    warning: "bg-status-warning/15 text-amber-600 dark:text-status-warning",
    critical: "bg-status-critical/10 text-status-critical",
  }

  return (
    // ไอคอนอยู่คู่กับตัวเลขเสมอ ไม่ซ้อนไว้บนสุดแบบก่อนหน้านี้ (เดิมมือถือจะกองไอคอน
    // ใหญ่ไว้บนแล้วค่อยเป็นตัวเลข ทำให้การ์ดสูงและว่างเกินความจำเป็น)
    // The icon always sits beside the number instead of stacked above it on
    // mobile (the old layout put a large icon on top, then the number below,
    // making each tile tall with a lot of wasted space).
    <div className="min-w-0 rounded-2xl border bg-card p-3.5 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1 break-words text-xl font-semibold tabular-nums tracking-tight sm:mt-2 sm:text-2xl">{value}</p>
          {hint && <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">{hint}</p>}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-11", toneClasses[tone])}>
          <Icon className="size-4 sm:size-4.5" aria-hidden />
        </span>
      </div>
    </div>
  )
}
