"use client"

import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { CalendarX } from "lucide-react"
import { useTranslations } from "@/i18n/client"
import { LeaveRequestSheet } from "./leave-request-sheet"
import type { LeaveRequestDetail } from "../queries"

export interface LeaveRequestRow extends LeaveRequestDetail {
  canDecide: boolean
  canCancel: boolean
}

export function LeaveRequestList({
  requests,
  showEmployee = false,
  emptyMessage,
}: {
  requests: LeaveRequestRow[]
  showEmployee?: boolean
  emptyMessage: string
}) {
  const t = useTranslations()

  if (requests.length === 0) {
    return <EmptyState icon={CalendarX} title={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployee && <TableHead>{t.employees.employee}</TableHead>}
            <TableHead>{t.leave.leaveType}</TableHead>
            <TableHead>{t.leave.dates}</TableHead>
            <TableHead>{t.common.days}</TableHead>
            <TableHead>{t.common.status}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <LeaveRequestSheet key={request.id} request={request} canDecide={request.canDecide} canCancel={request.canCancel}>
              {(open) => (
                <TableRow className="cursor-pointer" onClick={open}>
                  {showEmployee && <TableCell className="font-medium">{request.employeeName}</TableCell>}
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(request.startDate, "d MMM")} to {format(request.endDate, "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{request.days}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                </TableRow>
              )}
            </LeaveRequestSheet>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
