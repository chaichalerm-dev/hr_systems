"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import { LeaveApprovalTimeline } from "./leave-approval-timeline"
import { useTranslations } from "@/i18n/client"
import { formatLeaveError } from "../format-error"
import { cancelLeaveRequestAction, decideLeaveRequestAction } from "../actions"
import type { LeaveRequestDetail } from "../queries"

export function LeaveRequestSheet({
  request,
  canDecide,
  canCancel,
  children,
}: {
  request: LeaveRequestDetail
  canDecide: boolean
  canCancel: boolean
  /** ส่งฟังก์ชันเปิดรายละเอียดให้ปุ่มหรือแถวตารางเรียกได้
 * Pass an open function so either a button or a table row can show the details.
 */
  children: (open: () => void) => React.ReactNode
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [isPending, setIsPending] = useState(false)

  async function decide(decision: "APPROVED" | "REJECTED") {
    setIsPending(true)
    const formData = new FormData()
    formData.set("leaveRequestId", request.id)
    formData.set("decision", decision)
    formData.set("comment", comment)

    const result = await decideLeaveRequestAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      toast.error(formatLeaveError(t, result))
      return
    }
    toast.success(decision === "APPROVED" ? t.leave.approved : t.leave.rejected)
    setOpen(false)
  }

  async function cancel() {
    setIsPending(true)
    const result = await cancelLeaveRequestAction(request.id)
    setIsPending(false)
    if (result.error) {
      toast.error(formatLeaveError(t, result))
      return
    }
    toast.success(t.leave.cancelled)
    setOpen(false)
  }

  return (
    <>
      {children(() => setOpen(true))}
      <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {request.leaveType}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{request.employeeName}</p>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-sm font-medium">
              {format(request.startDate, "d MMM yyyy")} to {format(request.endDate, "d MMM yyyy")} · {request.days}{" "}
              {t.common.days}
            </p>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t.leave.approvalTimeline}
            </h3>
            <LeaveApprovalTimeline request={request} />
          </div>

          {canDecide && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="decision-comment">{t.leave.commentOptional}</Label>
              <Textarea
                id="decision-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder={t.leave.commentPlaceholder}
              />
            </div>
          )}
        </div>

        {/* สีเดียวกับ StatusBadge ของสถานะ APPROVED/REJECTED ด้านบน ให้เห็นชัดว่าเป็นการตัดสินใจตรงข้ามกัน */}
        {/* Matches the APPROVED/REJECTED StatusBadge colors above, so the two opposite decisions read clearly apart. */}
        {canDecide && (
          <SheetFooter className="flex-row gap-2">
            <Button variant="destructive" className="flex-1" disabled={isPending} onClick={() => decide("REJECTED")}>
              {t.leave.reject}
            </Button>
            <Button variant="success" className="flex-1" disabled={isPending} onClick={() => decide("APPROVED")}>
              {t.leave.approve}
            </Button>
          </SheetFooter>
        )}
        {canCancel && (
          <SheetFooter>
            <Button variant="outline" disabled={isPending} onClick={cancel}>
              {t.leave.cancelRequest}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
      </Sheet>
    </>
  )
}
