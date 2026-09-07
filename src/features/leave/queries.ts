import "server-only"

import { LeaveRequestStatus, Role } from "@prisma/client"
import type { Session } from "next-auth"

import { prisma } from "@/db/client"

export async function listLeaveTypes() {
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } })
}

export interface LeaveBalanceItem {
  leaveTypeId: string
  leaveType: string
  totalDays: number
  usedDays: number
  remainingDays: number
}

export async function listLeaveBalances(employeeId: string, year: number): Promise<LeaveBalanceItem[]> {
  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId, year },
    include: { leaveType: { select: { name: true } } },
    orderBy: { leaveType: { name: "asc" } },
  })
  return balances.map((b) => ({
    leaveTypeId: b.leaveTypeId,
    leaveType: b.leaveType.name,
    totalDays: Number(b.totalDays),
    usedDays: Number(b.usedDays),
    remainingDays: Number(b.remainingDays),
  }))
}

export interface LeaveApprovalStep {
  id: string
  level: string
  decision: string
  comment: string | null
  createdAt: Date
  approverName: string
}

export interface LeaveRequestDetail {
  id: string
  leaveTypeId: string
  leaveType: string
  startDate: Date
  endDate: Date
  days: number
  reason: string
  status: LeaveRequestStatus
  createdAt: Date
  employeeName: string
  employeeId: string
  approvals: LeaveApprovalStep[]
}

const LEAVE_REQUEST_INCLUDE = {
  leaveType: { select: { name: true } },
  employee: { select: { firstName: true, lastName: true } },
  approvals: {
    include: { approver: { select: { email: true, employee: { select: { firstName: true, lastName: true } } } } },
    orderBy: { createdAt: "asc" as const },
  },
}

type LeaveRequestRow = {
  id: string
  leaveTypeId: string
  startDate: Date
  endDate: Date
  days: unknown
  reason: string
  status: LeaveRequestStatus
  createdAt: Date
  employeeId: string
  leaveType: { name: string }
  employee: { firstName: string; lastName: string }
  approvals: {
    id: string
    level: string
    decision: string
    comment: string | null
    createdAt: Date
    approver: { email: string; employee: { firstName: string; lastName: string } | null }
  }[]
}

function mapLeaveRequest(row: LeaveRequestRow): LeaveRequestDetail {
  return {
    id: row.id,
    leaveTypeId: row.leaveTypeId,
    leaveType: row.leaveType.name,
    startDate: row.startDate,
    endDate: row.endDate,
    days: Number(row.days),
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt,
    employeeName: `${row.employee.firstName} ${row.employee.lastName}`,
    employeeId: row.employeeId,
    approvals: row.approvals.map((a) => ({
      id: a.id,
      level: a.level,
      decision: a.decision,
      comment: a.comment,
      createdAt: a.createdAt,
      approverName: a.approver.employee
        ? `${a.approver.employee.firstName} ${a.approver.employee.lastName}`
        : a.approver.email,
    })),
  }
}

export async function listMyLeaveRequests(employeeId: string): Promise<LeaveRequestDetail[]> {
  const rows = await prisma.leaveRequest.findMany({
    where: { employeeId },
    include: LEAVE_REQUEST_INCLUDE,
    orderBy: { createdAt: "desc" },
  })
  return rows.map(mapLeaveRequest)
}

/** ดึงคำขอที่รอคนนี้ตัดสินใจ ตามสิทธิ์หัวหน้าหรือฝ่ายบุคคล
 * Load requests awaiting this viewer’s decision at the manager or HR step.
 */
export async function listPendingApprovals(session: Session): Promise<LeaveRequestDetail[]> {
  const { role, employeeId } = session.user

  if (role === Role.HR) {
    const rows = await prisma.leaveRequest.findMany({
      where: { status: LeaveRequestStatus.PENDING_HR },
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: { createdAt: "asc" },
    })
    return rows.map(mapLeaveRequest)
  }

  if (role === Role.MANAGER && employeeId) {
    const rows = await prisma.leaveRequest.findMany({
      where: { status: LeaveRequestStatus.PENDING_MANAGER, employee: { managerId: employeeId } },
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: { createdAt: "asc" },
    })
    return rows.map(mapLeaveRequest)
  }

  if (role === Role.ADMIN) {
    const rows = await prisma.leaveRequest.findMany({
      where: { status: { in: [LeaveRequestStatus.PENDING_MANAGER, LeaveRequestStatus.PENDING_HR] } },
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: { createdAt: "asc" },
    })
    return rows.map(mapLeaveRequest)
  }

  return []
}
