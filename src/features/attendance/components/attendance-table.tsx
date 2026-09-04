"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/shared/data-table"
import { useTranslations } from "@/i18n/client"
import type { AttendanceHistoryItem } from "../queries"
import { buildAttendanceColumns } from "./attendance-columns"

export function AttendanceTable({ data }: { data: AttendanceHistoryItem[] }) {
  const t = useTranslations()
  const columns = useMemo(() => buildAttendanceColumns(t), [t])

  return <DataTable columns={columns} data={data} emptyMessage={t.attendance.noRecords} />
}
