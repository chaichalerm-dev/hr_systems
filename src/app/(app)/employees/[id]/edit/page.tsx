import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { getEmployeeById, listDepartments, listManagerCandidates, listPositions } from "@/features/employees/queries"
import { PageHeader } from "@/components/shared/page-header"
import { EmployeeForm } from "@/features/employees/components/employee-form"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Edit Employee" }

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const [, t] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary()])
  const { id } = await params

  const [employee, departments, positions, managers] = await Promise.all([
    getEmployeeById(id),
    listDepartments(),
    listPositions(),
    listManagerCandidates(id),
  ])

  if (!employee) notFound()

  return (
    <>
      <PageHeader
        title={`${t.employees.editEmployee} — ${employee.firstName} ${employee.lastName}`}
        breadcrumbs={[
          { label: t.employees.title, href: "/employees" },
          { label: `${employee.firstName} ${employee.lastName}`, href: `/employees/${id}` },
          { label: t.employees.editEmployee },
        ]}
      />
      <EmployeeForm
        mode="edit"
        employeeId={employee.id}
        departments={departments}
        positions={positions}
        managers={managers}
        defaultValues={{
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone ?? "",
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          employmentType: employee.employmentType,
          employmentStatus: employee.employmentStatus,
          salary: Number(employee.salary),
          startDate: employee.startDate,
          managerId: employee.managerId ?? "",
          emergencyContactName: employee.emergencyContactName ?? "",
          emergencyContactPhone: employee.emergencyContactPhone ?? "",
          emergencyContactRelation: employee.emergencyContactRelation ?? "",
          addressLine1: employee.addressLine1 ?? "",
          city: employee.city ?? "",
          province: employee.province ?? "",
          postalCode: employee.postalCode ?? "",
          country: employee.country ?? "Thailand",
          bankName: employee.bankName ?? "",
          bankAccountNumber: employee.bankAccountNumber ?? "",
          taxId: employee.taxId ?? "",
          socialSecurityNo: employee.socialSecurityNo ?? "",
        }}
      />
    </>
  )
}
