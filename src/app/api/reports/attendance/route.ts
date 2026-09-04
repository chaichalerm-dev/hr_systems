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
  const departmentId = searchParams.get("departmentId")

  const records = await prisma.attendance.findMany({
    where: {
      ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
      ...(departmentId ? { employee: { departmentId } } : {}),
    },
    include: { employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } } },
    orderBy: [{ date: "desc" }],
  })

  const header = ["Date", "Employee Code", "Employee Name", "Department", "Check In", "Check Out", "Hours", "Status"]
  const rows = records.map((r) => [
    format(r.date, "yyyy-MM-dd"),
    r.employee.employeeCode,
    `${r.employee.firstName} ${r.employee.lastName}`,
    r.employee.department.name,
    r.checkIn ? format(r.checkIn, "HH:mm") : "",
    r.checkOut ? format(r.checkOut, "HH:mm") : "",
    r.workingHours ? Number(r.workingHours).toFixed(2) : "",
    r.status,
  ])

  return csvResponse("attendance-report.csv", toCsv(header, rows))
}
