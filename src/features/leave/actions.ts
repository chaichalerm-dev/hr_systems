"use server"

import { revalidatePath } from "next/cache"
import { ApprovalDecision, ApprovalLevel, LeaveRequestStatus, Role } from "@prisma/client"

import { prisma } from "@/db/client"
import { requireSession } from "@/server/authorization"
import { recordAuditLog } from "@/server/services/audit-log"
import { calculateLeaveDays } from "@/server/services/leave-rules"
import { leaveDecisionSchema, leaveRequestFormSchema } from "@/validations/leave"

/** Error codes, not sentences — the client renders them in the viewer's language. */
export type LeaveErrorCode =
  | "noEmployeeProfile"
  | "invalidInput"
  | "noBusinessDays"
  | "unknownLeaveType"
  | "insufficientBalance"
  | "notFound"
  | "managerOnly"
  | "hrOnly"
  | "alreadyDecided"
  | "ownRequestsOnly"
  | "pendingOnly"

export interface LeaveActionState {
  error: LeaveErrorCode | null
  /** Filled in for errors whose message needs runtime values (e.g. remaining balance). */
  params?: Record<string, string>
}

export async function submitLeaveRequestAction(
  _prevState: LeaveActionState,
  formData: FormData
): Promise<LeaveActionState> {
  const session = await requireSession()
  if (!session.user.employeeId) return { error: "noEmployeeProfile" }

  const parsed = leaveRequestFormSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  const { leaveTypeId, startDate, endDate, reason, attachmentName, attachmentUrl } = parsed.data
  const days = calculateLeaveDays(startDate, endDate)
  if (days <= 0) return { error: "noBusinessDays" }

  const [employee, leaveType, balance] = await Promise.all([
    prisma.employee.findUnique({ where: { id: session.user.employeeId }, select: { managerId: true } }),
    prisma.leaveType.findUnique({ where: { id: leaveTypeId } }),
    prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: session.user.employeeId,
          leaveTypeId,
          year: startDate.getFullYear(),
        },
      },
    }),
  ])
  if (!leaveType) return { error: "unknownLeaveType" }

  if (leaveType.isPaid) {
    const remaining = balance ? Number(balance.remainingDays) : 0
    if (days > remaining) {
      return { error: "insufficientBalance", params: { remaining: String(remaining), type: leaveType.name } }
    }
  }

  const initialStatus = employee?.managerId ? LeaveRequestStatus.PENDING_MANAGER : LeaveRequestStatus.PENDING_HR

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      employeeId: session.user.employeeId,
      leaveTypeId,
      startDate,
      endDate,
      days,
      reason,
      attachmentName: attachmentName || null,
      attachmentUrl: attachmentUrl || null,
      status: initialStatus,
    },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "LEAVE_REQUESTED",
    entity: "LeaveRequest",
    entityId: leaveRequest.id,
    metadata: { days, leaveType: leaveType.name },
  })

  revalidatePath("/leave")
  return { error: null }
}

export async function decideLeaveRequestAction(
  _prevState: LeaveActionState,
  formData: FormData
): Promise<LeaveActionState> {
  const session = await requireSession()
  const parsed = leaveDecisionSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: "invalidInput" }

  const { leaveRequestId, decision, comment } = parsed.data

  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: { leaveType: true },
  })
  if (!leaveRequest) return { error: "notFound" }

  const isManagerStep = leaveRequest.status === LeaveRequestStatus.PENDING_MANAGER
  const isHrStep = leaveRequest.status === LeaveRequestStatus.PENDING_HR

  if (isManagerStep && session.user.role !== Role.MANAGER && session.user.role !== Role.ADMIN) {
    return { error: "managerOnly" }
  }
  if (isHrStep && session.user.role !== Role.HR && session.user.role !== Role.ADMIN) {
    return { error: "hrOnly" }
  }
  if (!isManagerStep && !isHrStep) {
    return { error: "alreadyDecided" }
  }

  const level = isManagerStep ? ApprovalLevel.MANAGER : ApprovalLevel.HR
  const approvalDecision = decision === "APPROVED" ? ApprovalDecision.APPROVED : ApprovalDecision.REJECTED

  await prisma.leaveApproval.create({
    data: {
      leaveRequestId,
      approverId: session.user.id,
      level,
      decision: approvalDecision,
      comment: comment || null,
    },
  })

  let nextStatus: LeaveRequestStatus
  if (approvalDecision === ApprovalDecision.REJECTED) {
    nextStatus = LeaveRequestStatus.REJECTED
  } else if (isManagerStep) {
    nextStatus = LeaveRequestStatus.PENDING_HR
  } else {
    nextStatus = LeaveRequestStatus.APPROVED
  }

  await prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { status: nextStatus } })

  if (nextStatus === LeaveRequestStatus.APPROVED) {
    const year = leaveRequest.startDate.getFullYear()
    const balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: leaveRequest.employeeId, leaveTypeId: leaveRequest.leaveTypeId, year } },
    })
    if (balance) {
      const usedDays = Number(balance.usedDays) + Number(leaveRequest.days)
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays, remainingDays: Number(balance.totalDays) - usedDays },
      })
    }
  }

  await recordAuditLog({
    actorId: session.user.id,
    action: nextStatus === LeaveRequestStatus.REJECTED ? "LEAVE_REJECTED" : "LEAVE_APPROVED",
    entity: "LeaveRequest",
    entityId: leaveRequestId,
    metadata: { level, comment: comment || undefined },
  })

  revalidatePath("/leave")
  return { error: null }
}

export async function cancelLeaveRequestAction(leaveRequestId: string): Promise<LeaveActionState> {
  const session = await requireSession()

  const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id: leaveRequestId } })
  if (!leaveRequest) return { error: "notFound" }
  if (leaveRequest.employeeId !== session.user.employeeId) return { error: "ownRequestsOnly" }
  if (leaveRequest.status !== LeaveRequestStatus.PENDING_MANAGER && leaveRequest.status !== LeaveRequestStatus.PENDING_HR) {
    return { error: "pendingOnly" }
  }

  await prisma.leaveRequest.update({ where: { id: leaveRequestId }, data: { status: LeaveRequestStatus.CANCELLED } })

  await recordAuditLog({
    actorId: session.user.id,
    action: "LEAVE_CANCELLED",
    entity: "LeaveRequest",
    entityId: leaveRequestId,
    metadata: {},
  })

  revalidatePath("/leave")
  return { error: null }
}
