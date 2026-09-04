import { Role } from "@prisma/client"
import { format } from "date-fns"

import { requireRole } from "@/server/authorization"
import { prisma } from "@/db/client"
import { toCsv, csvResponse } from "@/server/services/csv"

export async function GET(request: Request) {
  await requireRole([Role.ADMIN, Role.HR])
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const records = await prisma.leaveRequest.findMany({
    where: from && to ? { startDate: { gte: new Date(from) }, endDate: { lte: new Date(to) } } : {},
    include: {
      leaveType: { select: { name: true } },
      employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
    },
    orderBy: [{ startDate: "desc" }],
  })

  const header = ["Employee Code", "Employee Name", "Department", "Leave Type", "Start Date", "End Date", "Days", "Status"]
  const rows = records.map((r) => [
    r.employee.employeeCode,
    `${r.employee.firstName} ${r.employee.lastName}`,
    r.employee.department.name,
    r.leaveType.name,
    format(r.startDate, "yyyy-MM-dd"),
    format(r.endDate, "yyyy-MM-dd"),
    Number(r.days).toString(),
    r.status,
  ])

  return csvResponse("leave-report.csv", toCsv(header, rows))
}
