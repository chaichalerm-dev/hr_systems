"use client"

import { format } from "date-fns"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"

import { StatusBadge } from "@/components/shared/status-badge"
import type { Dictionary } from "@/i18n/dictionaries/en"
import type { AttendanceHistoryItem } from "../queries"

/** Built per-render from the dictionary so column headers follow the active locale. */
export function buildAttendanceColumns(t: Dictionary): LegacyColumnDef<AttendanceHistoryItem, unknown>[] {
  return [
    {
      id: "date",
      header: t.common.date,
      cell: ({ row }) => <span className="text-sm font-medium">{format(row.original.date, "EEE, d MMM yyyy")}</span>,
    },
    {
      id: "checkIn",
      header: t.attendance.checkIn,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.checkIn ? format(row.original.checkIn, "HH:mm") : "—"}
        </span>
      ),
    },
    {
      id: "checkOut",
      header: t.attendance.checkOut,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.checkOut ? format(row.original.checkOut, "HH:mm") : "—"}
        </span>
      ),
    },
    {
      id: "workingHours",
      header: t.attendance.hours,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.original.workingHours ? `${Number(row.original.workingHours).toFixed(1)}h` : "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t.common.status,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ]
}
