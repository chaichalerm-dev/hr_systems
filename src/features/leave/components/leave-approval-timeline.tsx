"use client"

import { format } from "date-fns"
import { CheckCircle2, XCircle, CircleDashed, Send } from "lucide-react"

import { useTranslations } from "@/i18n/client"
import type { LeaveRequestDetail } from "../queries"

export function LeaveApprovalTimeline({ request }: { request: LeaveRequestDetail }) {
  const t = useTranslations()
  const levelLabels: Record<string, string> = { MANAGER: t.leave.managerReview, HR: t.leave.hrReview }
  const isPendingManager = request.status === "PENDING_MANAGER"
  const isPendingHr = request.status === "PENDING_HR"

  return (
    <ol className="space-y-4">
      <li className="flex gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-status-good/10 text-status-good">
          <Send className="size-3.5" />
        </span>
        <div>
          <p className="text-sm font-medium">{t.leave.submittedBy.replace("{name}", request.employeeName)}</p>
          <p className="text-xs text-muted-foreground">{format(request.createdAt, "d MMM yyyy, HH:mm")}</p>
        </div>
      </li>

      {request.approvals.map((approval) => (
        <li key={approval.id} className="flex gap-3">
          <span
            className={
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full " +
              (approval.decision === "APPROVED"
                ? "bg-status-good/10 text-status-good"
                : "bg-status-critical/10 text-status-critical")
            }
          >
            {approval.decision === "APPROVED" ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
          </span>
          <div>
            <p className="text-sm font-medium">
              {(approval.decision === "APPROVED" ? t.leave.approvedBy : t.leave.rejectedBy)
                .replace("{level}", levelLabels[approval.level] ?? approval.level)
                .replace("{name}", approval.approverName)}
            </p>
            <p className="text-xs text-muted-foreground">{format(approval.createdAt, "d MMM yyyy, HH:mm")}</p>
            {approval.comment && (
              <p className="mt-1 text-xs text-muted-foreground">&ldquo;{approval.comment}&rdquo;</p>
            )}
          </div>
        </li>
      ))}

      {(isPendingManager || isPendingHr) && (
        <li className="flex gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CircleDashed className="size-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {isPendingManager ? t.leave.awaitingManager : t.leave.awaitingHr}
            </p>
          </div>
        </li>
      )}
    </ol>
  )
}
