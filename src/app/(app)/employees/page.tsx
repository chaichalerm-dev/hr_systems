import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import { Role } from "@prisma/client"

import { requirePageSession } from "@/server/authorization"
import { listDepartments, listEmployees } from "@/features/employees/queries"
import { employeeListFilterSchema } from "@/validations/employee"
import { PageHeader } from "@/components/shared/page-header"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { LinkButton } from "@/components/shared/link-button"
import { EmployeesTable } from "@/features/employees/components/employees-table"
import { EmployeesToolbar } from "@/features/employees/components/employees-toolbar"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Employees" }

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  if (session.user.role === Role.EMPLOYEE) redirect("/profile")

  const params = await searchParams
  const filter = employeeListFilterSchema.parse({
    search: typeof params.search === "string" ? params.search : undefined,
    departmentId: typeof params.departmentId === "string" ? params.departmentId : undefined,
    employmentStatus: typeof params.employmentStatus === "string" ? params.employmentStatus : undefined,
    page: typeof params.page === "string" ? params.page : undefined,
    pageSize: typeof params.pageSize === "string" ? params.pageSize : undefined,
  })

  const [{ items, total, page, pageSize }, departments] = await Promise.all([
    listEmployees(session, filter),
    listDepartments(),
  ])

  const canManage = session.user.role === Role.ADMIN || session.user.role === Role.HR

  return (
    <>
      <PageHeader
        title={t.employees.title}
        description={canManage ? t.employees.manageDescription : t.employees.teamDescription}
        actions={
          canManage ? (
            <LinkButton href="/employees/new">
              <Plus className="size-4" />
              {t.employees.addEmployee}
            </LinkButton>
          ) : undefined
        }
      />
      <div className="space-y-4">
        <EmployeesToolbar departments={departments} />
        <EmployeesTable data={items} />
        <PaginationControls page={page} pageSize={pageSize} total={total} />
      </div>
    </>
  )
}
