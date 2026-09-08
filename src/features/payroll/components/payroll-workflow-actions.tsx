"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CheckCircle2, ClipboardCheck, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "@/i18n/client"
import { approvePayrollRunAction, markPayrollPaidAction, reviewPayrollRunAction, type PayrollActionState } from "../actions"

export function PayrollWorkflowActions({ runId, status }: { runId: string; status: string }) {
  const t = useTranslations()
  const [isPending, startTransition] = useTransition()
  const [confirmPaidOpen, setConfirmPaidOpen] = useState(false)

  function run(action: () => Promise<PayrollActionState>, successMessage: string) {
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        toast.error(t.payroll.errors[result.error])
        return
      }
      toast.success(successMessage)
    })
  }

  if (status === "CALCULATED") {
    return (
      <Button disabled={isPending} onClick={() => run(() => reviewPayrollRunAction(runId), t.payroll.markedReviewed)}>
        <ClipboardCheck className="size-4" />
        {t.payroll.markReviewed}
      </Button>
    )
  }

  if (status === "REVIEWED") {
    return (
      <Button disabled={isPending} onClick={() => run(() => approvePayrollRunAction(runId), t.payroll.approvedToast)}>
        <CheckCircle2 className="size-4" />
        {t.payroll.approve}
      </Button>
    )
  }

  if (status === "APPROVED") {
    return (
      <AlertDialog open={confirmPaidOpen} onOpenChange={setConfirmPaidOpen}>
        <AlertDialogTrigger render={<Button />}>
          <Wallet className="size-4" />
          {t.payroll.markAsPaid}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.payroll.confirmPaidTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.payroll.confirmPaidDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => run(() => markPayrollPaidAction(runId), t.payroll.markedPaid)}
            >
              {t.payroll.markAsPaid}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return null
}
