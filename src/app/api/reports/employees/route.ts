import { Role } from "@prisma/client"
import { format } from "date-fns"

import { requireRole } from "@/server/authorization"
import { prisma } from "@/db/client"
import { toCsv, csvResponse } from "@/server/services/csv"

export async function GET() {
  await requireRole([Role.ADMIN, Role.HR])

  const employees = await prisma.employee.findMany({
    include: { department: { select: { name: true } }, position: { select: { title: true } }, manager: { select: { firstName: true, lastName: true } } },
    orderBy: { firstName: "asc" },
  })

  const header = [
    "Employee Code",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Department",
    "Position",
    "Employment Type",
    "Employment Status",
    "Manager",
    "Start Date",
  ]
  const rows = employees.map((e) => [
    e.employeeCode,
    e.firstName,
    e.lastName,
    e.email,
    e.phone ?? "",
    e.department.name,
    e.position.title,
    e.employmentType,
    e.employmentStatus,
    e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : "",
    format(e.startDate, "yyyy-MM-dd"),
  ])

  return csvResponse("employee-report.csv", toCsv(header, rows))
}
