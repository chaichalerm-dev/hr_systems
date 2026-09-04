import "server-only"

import type { Prisma } from "@prisma/client"

import { prisma } from "@/db/client"

export type AuditAction =
  | "EMPLOYEE_CREATED"
  | "EMPLOYEE_UPDATED"
  | "EMPLOYEE_DEACTIVATED"
  | "LEAVE_REQUESTED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "LEAVE_CANCELLED"
  | "ATTENDANCE_CHECKED_IN"
  | "ATTENDANCE_CHECKED_OUT"
  | "PAYROLL_GENERATED"
  | "PAYROLL_REVIEWED"
  | "PAYROLL_APPROVED"
  | "PAYROLL_PAID"
  | "PAYROLL_ADJUSTMENT_ADDED"
  | "COMPANY_SETTING_UPDATED"

export async function recordAuditLog(params: {
  actorId: string | null
  action: AuditAction
  entity: string
  entityId: string
  metadata?: Prisma.InputJsonValue
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
    },
  })
}
