import { Role } from "@prisma/client"
import type { Session } from "next-auth"

// Pure permission predicates — deliberately free of "server-only"/DB imports
// so they stay unit-testable without a request/DB context. Session-fetching
// helpers (requireSession/requireRole) live in ./index.ts instead.

export const canManageEmployees = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManageAttendanceRecords = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManagePayroll = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManageCompanySettings = (role: Role) => role === Role.ADMIN
export const canViewReports = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canApproveAsManager = (role: Role) => role === Role.MANAGER || role === Role.ADMIN
export const canApproveAsHR = (role: Role) => role === Role.HR || role === Role.ADMIN

/**
 * Employees may view their own records; HR/Admin may view everyone's;
 * Managers may view their direct reports'. Used for attendance, leave, and
 * profile detail pages/actions — payroll uses the stricter
 * `canViewEmployeePayroll` below.
 */
export function canViewEmployeeRecord(
  session: Session,
  employee: { id: string; managerId: string | null }
): boolean {
  const { role, employeeId } = session.user
  if (role === Role.ADMIN || role === Role.HR) return true
  if (employeeId === employee.id) return true
  if (role === Role.MANAGER && employee.managerId === employeeId) return true
  return false
}

/**
 * Payroll/salary data is sensitive: only Admin/HR (full access) or the
 * employee viewing their own payslip may see it. Managers do NOT
 * automatically get payroll access, even for their own reports.
 */
export function canViewEmployeePayroll(session: Session, employeeId: string): boolean {
  const { role, employeeId: sessionEmployeeId } = session.user
  if (role === Role.ADMIN || role === Role.HR) return true
  return sessionEmployeeId === employeeId
}
