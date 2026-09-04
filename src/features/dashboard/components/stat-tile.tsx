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
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
    </div>
  )
}
