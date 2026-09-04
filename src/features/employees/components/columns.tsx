"use client"

import Link from "next/link"
import { format } from "date-fns"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Dictionary } from "@/i18n/dictionaries/en"
import type { EmployeeListItem } from "../queries"
import { EmployeeRowActions } from "./employee-row-actions"

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

/** Built per-render from the dictionary so column headers follow the active locale. */
export function buildEmployeeColumns(t: Dictionary): LegacyColumnDef<EmployeeListItem, unknown>[] {
  return [
    {
      id: "employee",
      header: t.employees.employee,
      cell: ({ row }) => {
        const e = row.original
        return (
          <Link href={`/employees/${e.id}`} className="flex items-center gap-3 hover:underline">
            <Avatar className="size-9">
              <AvatarImage src={e.profileImageUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(e.firstName, e.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {e.firstName} {e.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {e.employeeCode} · {e.email}
              </p>
            </div>
          </Link>
        )
      },
    },
    {
      id: "department",
      header: t.employees.department,
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.department.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.position.title}</p>
        </div>
      ),
    },
    {
      id: "manager",
      header: t.employees.manager,
      cell: ({ row }) =>
        row.original.manager ? (
          <span className="text-sm">
            {row.original.manager.firstName} {row.original.manager.lastName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "employmentType",
      header: t.employees.type,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{t.employmentType[row.original.employmentType]}</span>
      ),
    },
    {
      id: "startDate",
      header: t.employees.startDate,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{format(row.original.startDate, "d MMM yyyy")}</span>
      ),
    },
    {
      id: "status",
      header: t.common.status,
      cell: ({ row }) => <StatusBadge status={row.original.employmentStatus} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <EmployeeRowActions
            employeeId={row.original.id}
            employeeName={`${row.original.firstName} ${row.original.lastName}`}
            isTerminated={row.original.employmentStatus === "TERMINATED"}
          />
        </div>
      ),
    },
  ]
}
