import { describe, expect, it } from "vitest"

import { calculatePayroll, type PayrollRules } from "./payroll-engine"

const rules: PayrollRules = {
  socialSecurityRate: 0.05,
  socialSecurityMaxBase: 15000,
  withholdingTaxRate: 0.03,
  lateDeductionPerMinute: 10,
  absenceDeductionDivisor: 30,
}

describe("calculatePayroll", () => {
  it("computes gross, deductions, and net for a plain salary with no extras", () => {
    const result = calculatePayroll({ baseSalary: 30000, rules })

    expect(result.grossIncome).toBe(30000)
    // social security: min(30000, 15000) * 0.05 = 750
    expect(result.socialSecurity).toBe(750)
    // withholding tax: 30000 * 0.03 = 900
    expect(result.withholdingTax).toBe(900)
    expect(result.totalDeductions).toBe(1650)
    expect(result.netSalary).toBe(28350)
  })

  it("caps social security contribution at the configured max base", () => {
    const result = calculatePayroll({ baseSalary: 100000, rules })

    // social security should be capped at 15000 * 0.05, not 100000 * 0.05
    expect(result.socialSecurity).toBe(750)
  })

  it("adds income components (overtime, allowance, bonus, commission, other) into gross", () => {
    const result = calculatePayroll({
      baseSalary: 30000,
      overtime: 1000,
      allowance: 1500,
      bonus: 2000,
      commission: 500,
      otherIncome: 100,
      rules,
    })

    expect(result.grossIncome).toBe(35100)
  })

  it("deducts absence days as a fraction of the daily rate", () => {
    const result = calculatePayroll({ baseSalary: 30000, absentDays: 2, rules })

    // daily rate = 30000 / 30 = 1000; 2 days absent = 2000 deduction
    expect(result.absenceDeduction).toBe(2000)
    expect(result.netSalary).toBe(30000 - 2000 - 750 - 900)
  })

  it("deducts unpaid leave days the same way as absences", () => {
    const result = calculatePayroll({ baseSalary: 30000, unpaidLeaveDays: 1, rules })

    expect(result.unpaidLeaveDeduction).toBe(1000)
  })

  it("deducts late minutes at the configured per-minute rate", () => {
    const result = calculatePayroll({ baseSalary: 30000, lateMinutesTotal: 45, rules })

    expect(result.lateDeduction).toBe(450)
  })

  it("folds in manual otherDeductions", () => {
    const result = calculatePayroll({ baseSalary: 30000, otherDeductions: 500, rules })

    expect(result.totalDeductions).toBe(750 + 900 + 500)
  })

  it("never lets rounding produce more than 2 decimal places", () => {
    const oddRules: PayrollRules = { ...rules, withholdingTaxRate: 0.0333 }
    const result = calculatePayroll({ baseSalary: 33333.33, rules: oddRules })

    const decimals = (n: number) => (n.toString().split(".")[1] ?? "").length
    expect(decimals(result.withholdingTax)).toBeLessThanOrEqual(2)
    expect(decimals(result.netSalary)).toBeLessThanOrEqual(2)
  })

  it("keeps net salary internally consistent with gross minus deductions", () => {
    const result = calculatePayroll({
      baseSalary: 45000,
      overtime: 800,
      allowance: 1200,
      absentDays: 1,
      lateMinutesTotal: 20,
      otherDeductions: 150,
      rules,
    })

    expect(result.netSalary).toBe(
      Math.round((result.grossIncome - result.totalDeductions) * 100) / 100
    )
  })
})
