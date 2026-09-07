import { Role } from "@prisma/client"
import type { Session } from "next-auth"

// แยกกฎสิทธิ์ออกจากฐานข้อมูลเพื่อทดสอบได้โดยไม่ต้องล็อกอินจริง ตัวช่วยอ่านเซสชันอยู่ใน index.ts
// Keep access rules independent of the database for unit tests; session helpers live in index.ts.

export const canManageEmployees = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManageAttendanceRecords = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManagePayroll = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canManageCompanySettings = (role: Role) => role === Role.ADMIN
export const canViewReports = (role: Role) => role === Role.ADMIN || role === Role.HR
export const canApproveAsManager = (role: Role) => role === Role.MANAGER || role === Role.ADMIN
export const canApproveAsHR = (role: Role) => role === Role.HR || role === Role.ADMIN

/** พนักงานดูตนเอง หัวหน้าดูลูกทีมโดยตรง และ HR/Admin ดูทุกคน กฎเงินเดือนตรวจแยกด้านล่าง
 * Employees see themselves, managers see direct reports, and HR/Admin see everyone; payroll has a separate check.
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

/** เงินเดือนดูได้เฉพาะเจ้าของข้อมูลและ HR/Admin หัวหน้าไม่ได้สิทธิ์ดูเงินเดือนลูกทีมโดยอัตโนมัติ
 * Only the employee and HR/Admin can view payroll; managing a team does not grant salary access.
 */
export function canViewEmployeePayroll(session: Session, employeeId: string): boolean {
  const { role, employeeId: sessionEmployeeId } = session.user
  if (role === Role.ADMIN || role === Role.HR) return true
  return sessionEmployeeId === employeeId
}
