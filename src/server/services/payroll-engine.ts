/** คำนวณเงินเดือนโดยไม่อ่านฐานข้อมูล ส่วนอ่านและบันทึกข้อมูลอยู่ใน payroll.ts สูตรภาษีและประกันสังคมเป็นตัวอย่าง ดูข้อจำกัดใน README
 * Calculate pay without database calls; payroll.ts loads and saves records. Tax and social security formulas are demo examples configured through CompanySetting.
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

/** ปัดยอดเงินเป็นทศนิยม 2 ตำแหน่งในแต่ละขั้นที่เรียกใช้
 * Round currency values to two decimal places where this helper is used.
 */
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
