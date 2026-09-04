/**
 * Payroll calculation engine — pure, DB-free functions so the arithmetic can
 * be unit tested in isolation. Orchestration (fetching employee/attendance
 * data, writing PayrollItem rows) lives in `payroll.ts`.
 *
 * IMPORTANT (see README "Limitations"): the tax/social-security formulas
 * here are simplified demo approximations of Thai payroll rules, not a
 * certified legal/accounting implementation. `PayrollRules` is intentionally
 * pulled from `CompanySetting` so real formulas can be swapped in later
 * without touching call sites.
 */

export interface PayrollRules {
  socialSecurityRate: number
  socialSecurityMaxBase: number
  withholdingTaxRate: number
  lateDeductionPerMinute: number
  absenceDeductionDivisor: number
}

export interface PayrollCalculationInput {
  baseSalary: number
  overtime?: number
  allowance?: number
  bonus?: number
  commission?: number
  otherIncome?: number
  unpaidLeaveDays?: number
  absentDays?: number
  lateMinutesTotal?: number
  otherDeductions?: number
  rules: PayrollRules
}

export interface PayrollCalculationResult {
  baseSalary: number
  overtime: number
  allowance: number
  bonus: number
  commission: number
  otherIncome: number
  grossIncome: number

  unpaidLeaveDeduction: number
  absenceDeduction: number
  lateDeduction: number
  socialSecurity: number
  withholdingTax: number
  otherDeductions: number
  totalDeductions: number

  netSalary: number
}

/** Rounds to 2 decimal places to avoid floating-point cent drift in currency math. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
  const {
    baseSalary,
    overtime = 0,
    allowance = 0,
    bonus = 0,
    commission = 0,
    otherIncome = 0,
    unpaidLeaveDays = 0,
    absentDays = 0,
    lateMinutesTotal = 0,
    otherDeductions = 0,
    rules,
  } = input

  const dailyRate = baseSalary / rules.absenceDeductionDivisor

  const grossIncome = round2(baseSalary + overtime + allowance + bonus + commission + otherIncome)

  const unpaidLeaveDeduction = round2(dailyRate * unpaidLeaveDays)
  const absenceDeduction = round2(dailyRate * absentDays)
  const lateDeduction = round2(lateMinutesTotal * rules.lateDeductionPerMinute)

  const socialSecurityBase = Math.min(baseSalary, rules.socialSecurityMaxBase)
  const socialSecurity = round2(socialSecurityBase * rules.socialSecurityRate)
  const withholdingTax = round2(grossIncome * rules.withholdingTaxRate)

  const totalDeductions = round2(
    unpaidLeaveDeduction + absenceDeduction + lateDeduction + socialSecurity + withholdingTax + otherDeductions
  )

  const netSalary = round2(grossIncome - totalDeductions)

  return {
    baseSalary: round2(baseSalary),
    overtime: round2(overtime),
    allowance: round2(allowance),
    bonus: round2(bonus),
    commission: round2(commission),
    otherIncome: round2(otherIncome),
    grossIncome,
    unpaidLeaveDeduction,
    absenceDeduction,
    lateDeduction,
    socialSecurity,
    withholdingTax,
    otherDeductions: round2(otherDeductions),
    totalDeductions,
    netSalary,
  }
}
