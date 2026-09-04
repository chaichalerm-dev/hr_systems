import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

import { requireRole } from "@/server/authorization"
import { getPayrollRunDetail } from "@/features/payroll/queries"
import { prisma } from "@/db/client"
import { csvResponse, toCsv } from "@/server/services/csv"

export async function GET(_request: Request, { params }: { params: Promise<{ runId: string }> }) {
  await requireRole([Role.ADMIN, Role.HR])
  const { runId } = await params

  const run = await getPayrollRunDetail(runId)
  if (!run) return NextResponse.json({ error: "Payroll run not found." }, { status: 404 })

  const header = [
    "Employee Code",
    "Employee Name",
    "Department",
    "Bank",
    "Bank Account",
    "Gross Salary",
    "Total Deductions",
    "Net Salary",
  ]

  const employeeIds = run.items.map((i) => i.employeeId)
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { id: true, bankName: true, bankAccountNumber: true },
  })
  const bankById = new Map(employees.map((e) => [e.id, e]))

  const rows = run.items.map((item) => {
    const bank = bankById.get(item.employeeId)
    return [
      item.employeeCode,
      item.employeeName,
      item.department,
      bank?.bankName ?? "",
      bank?.bankAccountNumber ?? "",
      item.grossIncome.toFixed(2),
      item.totalDeductions.toFixed(2),
      item.netSalary.toFixed(2),
    ]
  })

  return csvResponse(`payroll-${run.year}-${String(run.month).padStart(2, "0")}.csv`, toCsv(header, rows))
}
