import "server-only"

import { AdjustmentType, AttendanceStatus, PayrollStatus } from "@prisma/client"

import { prisma } from "@/db/client"
import { calculateLateMinutes } from "./attendance-rules"
import { calculatePayroll } from "./payroll-engine"
import { getAttendanceRules, getPayrollRules } from "./company-settings"

/** คำนวณเงินเดือนพนักงานที่ทำงานอยู่จากเงินเดือนพื้นฐานและการลงเวลาของเดือนนั้น รอบที่ยังแก้ได้จะคำนวณทับรายการเดิม
 * Calculate monthly pay for active employees from salary and attendance; eligible reruns update existing items.
 */
export async function generatePayrollRun(month: number, year: number, createdById: string): Promise<string> {
  const [payrollRules, attendanceRules] = await Promise.all([getPayrollRules(), getAttendanceRules()])

  const run = await prisma.payrollRun.upsert({
    where: { month_year: { month, year } },
    create: { month, year, status: PayrollStatus.CALCULATED, createdById },
    update: { status: PayrollStatus.CALCULATED },
  })

  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0)
  const employees = await prisma.employee.findMany({ where: { employmentStatus: "ACTIVE" } })

  for (const employee of employees) {
    const attendance = await prisma.attendance.findMany({
      where: { employeeId: employee.id, date: { gte: periodStart, lte: periodEnd } },
    })
    const absentDays = attendance.filter((a) => a.status === AttendanceStatus.ABSENT).length
    const lateMinutesTotal = attendance
      .filter((a) => a.status === AttendanceStatus.LATE && a.checkIn)
      .reduce((sum, a) => sum + calculateLateMinutes(a.checkIn!, attendanceRules), 0)

    const result = calculatePayroll({
      baseSalary: Number(employee.salary),
      absentDays,
      lateMinutesTotal,
      rules: payrollRules,
    })

    await prisma.payrollItem.upsert({
      where: { payrollRunId_employeeId: { payrollRunId: run.id, employeeId: employee.id } },
      create: {
        payrollRunId: run.id,
        employeeId: employee.id,
        baseSalary: result.baseSalary,
        overtime: result.overtime,
        allowance: result.allowance,
        bonus: result.bonus,
        commission: result.commission,
        otherIncome: result.otherIncome,
        unpaidLeaveDeduction: result.unpaidLeaveDeduction,
        absenceDeduction: result.absenceDeduction,
        lateDeduction: result.lateDeduction,
        socialSecurity: result.socialSecurity,
        withholdingTax: result.withholdingTax,
        otherDeductions: result.otherDeductions,
        grossIncome: result.grossIncome,
        totalDeductions: result.totalDeductions,
        netSalary: result.netSalary,
      },
      update: {
        baseSalary: result.baseSalary,
        absenceDeduction: result.absenceDeduction,
        lateDeduction: result.lateDeduction,
        socialSecurity: result.socialSecurity,
        withholdingTax: result.withholdingTax,
        grossIncome: result.grossIncome,
        totalDeductions: result.totalDeductions,
        netSalary: result.netSalary,
      },
    })
  }

  return run.id
}

/** เพิ่มรายการรับหรือหัก แล้วปรับยอดรวมที่บันทึกให้ตรงกัน
 * Add a manual adjustment and update the stored totals.
 */
export async function addPayrollAdjustment(
  payrollItemId: string,
  type: AdjustmentType,
  label: string,
  amount: number,
  note: string | null
) {
  const item = await prisma.payrollItem.findUniqueOrThrow({ where: { id: payrollItemId } })

  await prisma.payrollAdjustment.create({ data: { payrollItemId, type, label, amount, note } })

  const otherIncome = Number(item.otherIncome) + (type === AdjustmentType.INCOME ? amount : 0)
  const otherDeductions = Number(item.otherDeductions) + (type === AdjustmentType.DEDUCTION ? amount : 0)
  const grossIncome =
    Number(item.baseSalary) + Number(item.overtime) + Number(item.allowance) + Number(item.bonus) + Number(item.commission) + otherIncome
  const totalDeductions =
    Number(item.unpaidLeaveDeduction) +
    Number(item.absenceDeduction) +
    Number(item.lateDeduction) +
    Number(item.socialSecurity) +
    Number(item.withholdingTax) +
    otherDeductions
  const netSalary = grossIncome - totalDeductions

  await prisma.payrollItem.update({
    where: { id: payrollItemId },
    data: { otherIncome, otherDeductions, grossIncome, totalDeductions, netSalary },
  })
}

export async function markPayrollRunPaid(payrollRunId: string) {
  const items = await prisma.payrollItem.findMany({ where: { payrollRunId }, select: { id: true } })
  for (const item of items) {
    await prisma.payslip.upsert({
      where: { payrollItemId: item.id },
      create: { payrollItemId: item.id },
      update: {},
    })
  }
}
