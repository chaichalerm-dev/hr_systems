"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Eye, Pencil, MoreHorizontal, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "@/i18n/client"
import { deactivateEmployeeAction } from "../actions"

export function EmployeeRowActions({
  employeeId,
  employeeName,
  isTerminated,
}: {
  employeeId: string
  employeeName: string
  isTerminated: boolean
}) {
  const t = useTranslations()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDeactivate() {
    startTransition(async () => {
      await deactivateEmployeeAction(employeeId)
      toast.success(t.employees.deactivated.replace("{name}", employeeName))
      setConfirmOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t.common.actions} />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/employees/${employeeId}`} />}>
            <Eye className="size-4" />
            {t.employees.viewProfile}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/employees/${employeeId}/edit`} />}>
            <Pencil className="size-4" />
            {t.employees.editEmployee}
          </DropdownMenuItem>
          {!isTerminated && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
                <UserX className="size-4" />
                {t.employees.deactivate}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.employees.deactivateTitle.replace("{name}", employeeName)}</AlertDialogTitle>
            <AlertDialogDescription>{t.employees.deactivateDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleDeactivate}>
              {t.employees.deactivate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
