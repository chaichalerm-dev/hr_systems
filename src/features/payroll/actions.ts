"use server"

import { revalidatePath } from "next/cache"
import { AdjustmentType, PayrollStatus, Role } from "@prisma/client"

import { prisma } from "@/db/client"
import { requireRole } from "@/server/authorization"
import { recordAuditLog } from "@/server/services/audit-log"
import { addPayrollAdjustment, generatePayrollRun, markPayrollRunPaid } from "@/server/services/payroll"
import { generatePayrollRunSchema, payrollAdjustmentFormSchema } from "@/validations/payroll"

/** ส่งรหัสข้อผิดพลาดให้หน้าจอเลือกคำแปลตามภาษาผู้ใช้
 * Return an error code so the screen can choose the translated message.
 */
export type PayrollErrorCode = "invalidInput" | "notFound" | "invalidTransition"

export interface PayrollActionState {
  error: PayrollErrorCode | null
}

export async function generatePayrollRunAction(
  _prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const parsed = generatePayrollRunSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  const runId = await generatePayrollRun(parsed.data.month, parsed.data.year, session.user.id)

  await recordAuditLog({
    actorId: session.user.id,
    action: "PAYROLL_GENERATED",
    entity: "PayrollRun",
    entityId: runId,
    metadata: { month: parsed.data.month, year: parsed.data.year },
  })

  revalidatePath("/payroll")
  return { error: null }
}

async function transitionPayrollRun(
  runId: string,
  from: PayrollStatus[],
  to: PayrollStatus,
  extraData: Record<string, unknown> = {}
) {
  const run = await prisma.payrollRun.findUnique({ where: { id: runId } })
  if (!run) return { error: "notFound" as const }
  if (!from.includes(run.status)) return { error: "invalidTransition" as const }

  await prisma.payrollRun.update({ where: { id: runId }, data: { status: to, ...extraData } })
  return { error: null as PayrollErrorCode | null }
}

export async function reviewPayrollRunAction(runId: string): Promise<PayrollActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const result = await transitionPayrollRun(runId, [PayrollStatus.CALCULATED], PayrollStatus.REVIEWED)
  if (result.error) return result

  await recordAuditLog({ actorId: session.user.id, action: "PAYROLL_REVIEWED", entity: "PayrollRun", entityId: runId, metadata: {} })
  revalidatePath(`/payroll/${runId}`)
  return { error: null }
}

export async function approvePayrollRunAction(runId: string): Promise<PayrollActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const result = await transitionPayrollRun(runId, [PayrollStatus.REVIEWED], PayrollStatus.APPROVED, {
    approvedById: session.user.id,
  })
  if (result.error) return result

  await recordAuditLog({ actorId: session.user.id, action: "PAYROLL_APPROVED", entity: "PayrollRun", entityId: runId, metadata: {} })
  revalidatePath(`/payroll/${runId}`)
  return { error: null }
}

export async function markPayrollPaidAction(runId: string): Promise<PayrollActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const result = await transitionPayrollRun(runId, [PayrollStatus.APPROVED], PayrollStatus.PAID, { paidAt: new Date() })
  if (result.error) return result

  await markPayrollRunPaid(runId)

  await recordAuditLog({ actorId: session.user.id, action: "PAYROLL_PAID", entity: "PayrollRun", entityId: runId, metadata: {} })
  revalidatePath(`/payroll/${runId}`)
  revalidatePath("/payslips")
  return { error: null }
}

export async function addPayrollAdjustmentAction(
  _prevState: PayrollActionState,
  formData: FormData
): Promise<PayrollActionState> {
  const session = await requireRole([Role.ADMIN, Role.HR])
  const parsed = payrollAdjustmentFormSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  await addPayrollAdjustment(
    parsed.data.payrollItemId,
    parsed.data.type as AdjustmentType,
    parsed.data.label,
    parsed.data.amount,
    parsed.data.note || null
  )

  await recordAuditLog({
    actorId: session.user.id,
    action: "PAYROLL_ADJUSTMENT_ADDED",
    entity: "PayrollItem",
    entityId: parsed.data.payrollItemId,
    metadata: { type: parsed.data.type, amount: parsed.data.amount },
  })

  revalidatePath("/payroll")
  return { error: null }
}
