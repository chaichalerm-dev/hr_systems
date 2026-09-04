import type { Metadata } from "next"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { listDepartments, listManagerCandidates, listPositions } from "@/features/employees/queries"
import { PageHeader } from "@/components/shared/page-header"
import { EmployeeForm } from "@/features/employees/components/employee-form"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Add Employee" }

export default async function NewEmployeePage() {
  const [, t] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary()])

  const [departments, positions, managers] = await Promise.all([
    listDepartments(),
    listPositions(),
    listManagerCandidates(),
  ])

  return (
    <>
      <PageHeader
        title={t.employees.addEmployee}
        breadcrumbs={[{ label: t.employees.title, href: "/employees" }, { label: t.employees.addEmployee }]}
      />
      <EmployeeForm mode="create" departments={departments} positions={positions} managers={managers} />
    </>
  )
}
