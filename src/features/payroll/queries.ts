import "server-only"

import { format } from "date-fns"

import { prisma } from "@/db/client"

export interface PayrollRunListItem {
  id: string
  month: number
  year: number
  status: string
  employeeCount: number
  totalNet: number
  createdAt: Date
  paidAt: Date | null
}

export async function listPayrollRuns(): Promise<PayrollRunListItem[]> {
  const runs = await prisma.payrollRun.findMany({
    include: { items: { select: { netSalary: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
  return runs.map((run) => ({
    id: run.id,
    month: run.month,
    year: run.year,
    status: run.status,
    employeeCount: run.items.length,
    totalNet: run.items.reduce((sum, i) => sum + Number(i.netSalary), 0),
    createdAt: run.createdAt,
    paidAt: run.paidAt,
  }))
}

export interface PayrollItemRow {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  baseSalary: number
  allowance: number
  bonus: number
  commission: number
  otherIncome: number
  overtime: number
  unpaidLeaveDeduction: number
  absenceDeduction: number
  lateDeduction: number
  socialSecurity: number
  withholdingTax: number
  otherDeductions: number
  grossIncome: number
  totalDeductions: number
  netSalary: number
  adjustmentCount: number
}

export interface PayrollRunDetail {
  id: string
  month: number
  year: number
  status: string
  createdByName: string
  approvedByName: string | null
  paidAt: Date | null
  items: PayrollItemRow[]
}

export async function getPayrollRunDetail(id: string): Promise<PayrollRunDetail | null> {
  const run = await prisma.payrollRun.findUnique({
    where: { id },
    include: {
      createdBy: { select: { email: true, employee: { select: { firstName: true, lastName: true } } } },
      approvedBy: { select: { email: true, employee: { select: { firstName: true, lastName: true } } } },
      items: {
        include: {
          employee: { select: { firstName: true, lastName: true, employeeCode: true, department: { select: { name: true } } } },
          _count: { select: { adjustments: true } },
        },
        orderBy: { employee: { firstName: "asc" } },
      },
    },
  })
  if (!run) return null

  const userLabel = (u: { email: string; employee: { firstName: string; lastName: string } | null }) =>
    u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : u.email

  return {
    id: run.id,
    month: run.month,
    year: run.year,
    status: run.status,
    createdByName: userLabel(run.createdBy),
    approvedByName: run.approvedBy ? userLabel(run.approvedBy) : null,
    paidAt: run.paidAt,
    items: run.items.map((item) => ({
      id: item.id,
      employeeId: item.employeeId,
      employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
      employeeCode: item.employee.employeeCode,
      department: item.employee.department.name,
      baseSalary: Number(item.baseSalary),
      allowance: Number(item.allowance),
      bonus: Number(item.bonus),
      commission: Number(item.commission),
      otherIncome: Number(item.otherIncome),
      overtime: Number(item.overtime),
      unpaidLeaveDeduction: Number(item.unpaidLeaveDeduction),
      absenceDeduction: Number(item.absenceDeduction),
      lateDeduction: Number(item.lateDeduction),
      socialSecurity: Number(item.socialSecurity),
      withholdingTax: Number(item.withholdingTax),
      otherDeductions: Number(item.otherDeductions),
      grossIncome: Number(item.grossIncome),
      totalDeductions: Number(item.totalDeductions),
      netSalary: Number(item.netSalary),
      adjustmentCount: item._count.adjustments,
    })),
  }
}

export interface PayslipListItem {
  id: string
  payrollItemId: string
  period: string
  netSalary: number
  issuedAt: Date
}

export async function listEmployeePayslips(employeeId: string): Promise<PayslipListItem[]> {
  const payslips = await prisma.payslip.findMany({
    where: { payrollItem: { employeeId } },
    include: { payrollItem: { include: { payrollRun: true } } },
    orderBy: { issuedAt: "desc" },
  })
  return payslips.map((p) => ({
    id: p.id,
    payrollItemId: p.payrollItemId,
    period: format(new Date(p.payrollItem.payrollRun.year, p.payrollItem.payrollRun.month - 1, 1), "MMMM yyyy"),
    netSalary: Number(p.payrollItem.netSalary),
    issuedAt: p.issuedAt,
  }))
}

/** รายการมาตรฐานใช้คำแปลจาก labelKey ส่วนชื่อรายการที่ HR กรอกเองแสดงตามที่บันทึก
 * Translate built-in payslip lines by labelKey and keep manual adjustment labels as entered.
 */
export interface PayslipLine {
  labelKey: PayslipLineKey | null
  label: string
  amount: number
}

export type PayslipLineKey =
  | "baseSalary"
  | "overtime"
  | "allowance"
  | "bonus"
  | "commission"
  | "unpaidLeave"
  | "absence"
  | "lateArrival"
  | "socialSecurity"
  | "withholdingTax"

export interface PayslipDetail {
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string
  bankName: string | null
  bankAccountNumber: string | null
  period: string
  month: number
  year: number
  income: PayslipLine[]
  deductions: PayslipLine[]
  grossIncome: number
  totalDeductions: number
  netSalary: number
  issuedAt: Date | null
  runStatus: string
}

export async function getPayslipDetail(payrollItemId: string): Promise<PayslipDetail | null> {
  const item = await prisma.payrollItem.findUnique({
    where: { id: payrollItemId },
    include: {
      employee: { include: { department: true, position: true } },
      payrollRun: true,
      payslip: true,
      adjustments: true,
    },
  })
  if (!item) return null

  const income: PayslipLine[] = ([
    { labelKey: "baseSalary", label: "Base salary", amount: Number(item.baseSalary) },
    { labelKey: "overtime", label: "Overtime", amount: Number(item.overtime) },
    { labelKey: "allowance", label: "Allowance", amount: Number(item.allowance) },
    { labelKey: "bonus", label: "Bonus", amount: Number(item.bonus) },
    { labelKey: "commission", label: "Commission", amount: Number(item.commission) },
    ...item.adjustments
      .filter((a) => a.type === "INCOME")
      .map((a) => ({ labelKey: null, label: a.label, amount: Number(a.amount) })),
  ] satisfies PayslipLine[]).filter((i) => i.amount > 0)

  const deductions: PayslipLine[] = ([
    { labelKey: "unpaidLeave", label: "Unpaid leave", amount: Number(item.unpaidLeaveDeduction) },
    { labelKey: "absence", label: "Absence", amount: Number(item.absenceDeduction) },
    { labelKey: "lateArrival", label: "Late arrival", amount: Number(item.lateDeduction) },
    { labelKey: "socialSecurity", label: "Social security", amount: Number(item.socialSecurity) },
    { labelKey: "withholdingTax", label: "Withholding tax", amount: Number(item.withholdingTax) },
    ...item.adjustments
      .filter((a) => a.type === "DEDUCTION")
      .map((a) => ({ labelKey: null, label: a.label, amount: Number(a.amount) })),
  ] satisfies PayslipLine[]).filter((d) => d.amount > 0)

  return {
    employeeId: item.employeeId,
    employeeName: `${item.employee.firstName} ${item.employee.lastName}`,
    employeeCode: item.employee.employeeCode,
    department: item.employee.department.name,
    position: item.employee.position.title,
    bankName: item.employee.bankName,
    bankAccountNumber: item.employee.bankAccountNumber,
    period: format(new Date(item.payrollRun.year, item.payrollRun.month - 1, 1), "MMMM yyyy"),
    month: item.payrollRun.month,
    year: item.payrollRun.year,
    income,
    deductions,
    grossIncome: Number(item.grossIncome),
    totalDeductions: Number(item.totalDeductions),
    netSalary: Number(item.netSalary),
    issuedAt: item.payslip?.issuedAt ?? null,
    runStatus: item.payrollRun.status,
  }
}

export interface TaxDocumentQueryResult {
  employeeName: string
  employeeCode: string
  taxId: string | null
  socialSecurityNo: string | null
  totalGrossIncome: number
  totalWithholdingTax: number
  totalSocialSecurity: number
  monthsIncluded: number
}

export async function getTaxDocumentData(employeeId: string, year: number): Promise<TaxDocumentQueryResult | null> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { firstName: true, lastName: true, employeeCode: true, taxId: true, socialSecurityNo: true },
  })
  if (!employee) return null

  const items = await prisma.payrollItem.findMany({
    where: { employeeId, payrollRun: { year, status: "PAID" } },
    select: { grossIncome: true, withholdingTax: true, socialSecurity: true },
  })

  return {
    employeeName: `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeCode,
    taxId: employee.taxId,
    socialSecurityNo: employee.socialSecurityNo,
    totalGrossIncome: items.reduce((sum, i) => sum + Number(i.grossIncome), 0),
    totalWithholdingTax: items.reduce((sum, i) => sum + Number(i.withholdingTax), 0),
    totalSocialSecurity: items.reduce((sum, i) => sum + Number(i.socialSecurity), 0),
    monthsIncluded: items.length,
  }
}
