import { z } from "zod"

export const generatePayrollRunSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
})

export type GeneratePayrollRunInput = z.infer<typeof generatePayrollRunSchema>

export const payrollAdjustmentFormSchema = z.object({
  payrollItemId: z.string().min(1),
  type: z.enum(["INCOME", "DEDUCTION"]),
  label: z.string().min(2, "Give the adjustment a short label.").max(100),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  note: z.string().max(500).optional().or(z.literal("")),
})

export type PayrollAdjustmentFormInput = z.infer<typeof payrollAdjustmentFormSchema>

export const payrollRulesFormSchema = z.object({
  socialSecurityRate: z.coerce.number().min(0).max(1),
  socialSecurityMaxBase: z.coerce.number().min(0),
  withholdingTaxRate: z.coerce.number().min(0).max(1),
  lateDeductionPerMinute: z.coerce.number().min(0),
  absenceDeductionDivisor: z.coerce.number().min(1).max(31),
})

export type PayrollRulesFormInput = z.infer<typeof payrollRulesFormSchema>

// Client-side (react-hook-form holds real numbers already).
export const payrollRulesFormClientSchema = z.object({
  socialSecurityRate: z.number().min(0).max(1),
  socialSecurityMaxBase: z.number().min(0),
  withholdingTaxRate: z.number().min(0).max(1),
  lateDeductionPerMinute: z.number().min(0),
  absenceDeductionDivisor: z.number().min(1).max(31),
})
