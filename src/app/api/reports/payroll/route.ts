import { Role } from "@prisma/client"
import { format } from "date-fns"

import { requireRole } from "@/server/authorization"
import { prisma } from "@/db/client"
import { toCsv, csvResponse } from "@/server/services/csv"

export async function GET(request: Request) {
  await requireRole([Role.ADMIN, Role.HR])
  const { searchParams } = new URL(request.url)
  const year = searchParams.get("year")

  const items = await prisma.payrollItem.findMany({
    where: year ? { payrollRun: { year: Number(year) } } : {},
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
      payrollRun: { select: { month: true, year: true, status: true } },
    },
    orderBy: [{ payrollRun: { year: "desc" } }, { payrollRun: { month: "desc" } }],
  })

  const header = ["Period", "Employee Code", "Employee Name", "Department", "Gross", "Deductions", "Net", "Run Status"]
  const rows = items.map((i) => [
    format(new Date(i.payrollRun.year, i.payrollRun.month - 1, 1), "yyyy-MM"),
    i.employee.employeeCode,
    `${i.employee.firstName} ${i.employee.lastName}`,
    i.employee.department.name,
    Number(i.grossIncome).toFixed(2),
    Number(i.totalDeductions).toFixed(2),
    Number(i.netSalary).toFixed(2),
    i.payrollRun.status,
  ])

  return csvResponse("payroll-report.csv", toCsv(header, rows))
}
