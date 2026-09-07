"use client"

import { cn } from "@/lib/utils"
import { useTranslations } from "@/i18n/client"
import type { Dictionary } from "@/i18n/dictionaries/en"

type StatusTone = "good" | "warning" | "serious" | "critical" | "neutral" | "info"

const TONE_CLASSES: Record<StatusTone, string> = {
  good: "bg-status-good/10 text-status-good border-status-good/20",
  warning: "bg-status-warning/15 text-amber-700 dark:text-status-warning border-status-warning/25",
  serious: "bg-status-serious/15 text-status-serious border-status-serious/25",
  critical: "bg-status-critical/10 text-status-critical border-status-critical/20",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/20",
}

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  // สถานะลงเวลา
  // Attendance status.
  PRESENT: "good",
  LATE: "warning",
  ABSENT: "critical",
  LEAVE: "info",
  HOLIDAY: "neutral",
  NOT_CHECKED_IN: "neutral",
  // สถานะคำขอลา
  // Leave request status.
  PENDING_MANAGER: "warning",
  PENDING_HR: "warning",
  APPROVED: "good",
  REJECTED: "critical",
  CANCELLED: "neutral",
  // สถานะรอบเงินเดือน
  // Payroll run status.
  DRAFT: "neutral",
  CALCULATED: "info",
  REVIEWED: "warning",
  PAID: "good",
  // สถานะการจ้างงาน
  // Employment status.
  ACTIVE: "good",
  ON_LEAVE: "info",
  SUSPENDED: "warning",
  TERMINATED: "critical",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const t = useTranslations()
  const tone = STATUS_TONE_MAP[status] ?? "neutral"
  const label = t.status[status as keyof Dictionary["status"]] ?? status

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  )
}
