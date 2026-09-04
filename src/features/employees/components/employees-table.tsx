"use client"

import { useMemo } from "react"

import { DataTable } from "@/components/shared/data-table"
import { useTranslations } from "@/i18n/client"
import type { EmployeeListItem } from "../queries"
import { buildEmployeeColumns } from "./columns"

export function EmployeesTable({ data }: { data: EmployeeListItem[] }) {
  const t = useTranslations()
  const columns = useMemo(() => buildEmployeeColumns(t), [t])

  return <DataTable columns={columns} data={data} emptyMessage={t.employees.noMatch} />
}
