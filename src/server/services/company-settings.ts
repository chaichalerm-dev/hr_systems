import "server-only"

import type { Prisma } from "@prisma/client"

import { prisma } from "@/db/client"
import { DEFAULT_ATTENDANCE_RULES, DEFAULT_PAYROLL_RULES } from "@/lib/constants"
import type { AttendanceRules } from "./attendance-rules"
import type { PayrollRules } from "./payroll-engine"

export const COMPANY_SETTING_KEYS = {
  ATTENDANCE_RULES: "ATTENDANCE_RULES",
  PAYROLL_RULES: "PAYROLL_RULES",
} as const

export async function getAttendanceRules(): Promise<AttendanceRules> {
  const setting = await prisma.companySetting.findUnique({
    where: { key: COMPANY_SETTING_KEYS.ATTENDANCE_RULES },
  })
  return (setting?.value as unknown as AttendanceRules | undefined) ?? DEFAULT_ATTENDANCE_RULES
}

export async function getPayrollRules(): Promise<PayrollRules> {
  const setting = await prisma.companySetting.findUnique({
    where: { key: COMPANY_SETTING_KEYS.PAYROLL_RULES },
  })
  return (setting?.value as unknown as PayrollRules | undefined) ?? DEFAULT_PAYROLL_RULES
}

export async function updateCompanySetting(key: string, value: Prisma.InputJsonValue) {
  await prisma.companySetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}
