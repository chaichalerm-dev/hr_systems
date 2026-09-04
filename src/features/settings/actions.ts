"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

import { requireRole } from "@/server/authorization"
import { updateCompanySetting, COMPANY_SETTING_KEYS } from "@/server/services/company-settings"
import { recordAuditLog } from "@/server/services/audit-log"
import { attendanceRulesFormSchema } from "@/validations/attendance"
import { payrollRulesFormSchema } from "@/validations/payroll"

/** Error codes, not sentences — the client renders them in the viewer's language. */
export interface SettingsActionState {
  error: "invalidInput" | null
}

export async function updateAttendanceRulesAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await requireRole([Role.ADMIN])
  const parsed = attendanceRulesFormSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  await updateCompanySetting(COMPANY_SETTING_KEYS.ATTENDANCE_RULES, parsed.data)
  await recordAuditLog({
    actorId: session.user.id,
    action: "COMPANY_SETTING_UPDATED",
    entity: "CompanySetting",
    entityId: COMPANY_SETTING_KEYS.ATTENDANCE_RULES,
    metadata: parsed.data,
  })

  revalidatePath("/settings")
  return { error: null }
}

export async function updatePayrollRulesAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await requireRole([Role.ADMIN])
  const parsed = payrollRulesFormSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  await updateCompanySetting(COMPANY_SETTING_KEYS.PAYROLL_RULES, parsed.data)
  await recordAuditLog({
    actorId: session.user.id,
    action: "COMPANY_SETTING_UPDATED",
    entity: "CompanySetting",
    entityId: COMPANY_SETTING_KEYS.PAYROLL_RULES,
    metadata: parsed.data,
  })

  revalidatePath("/settings")
  return { error: null }
}
