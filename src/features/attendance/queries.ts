import "server-only"

import { endOfDay, startOfDay, startOfMonth, endOfMonth } from "date-fns"

import { prisma } from "@/db/client"
import { AttendanceStatus } from "@prisma/client"

export async function getTodayAttendance(employeeId: string) {
  return prisma.attendance.findFirst({
    where: { employeeId, date: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } },
  })
}

export interface AttendanceHistoryItem {
  id: string
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  workingHours: number | null
  status: AttendanceStatus
}

export async function listAttendanceHistory(employeeId: string, take = 30): Promise<AttendanceHistoryItem[]> {
  // แปลง Decimal ของ Prisma เป็นตัวเลขก่อนส่งให้หน้าจอ เพราะ props ต้องเป็นค่าที่ React ส่งต่อได้
  // Convert Prisma Decimal values to numbers before passing them to client components.
  const rows = await prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { date: "desc" },
    take,
    select: { id: true, date: true, checkIn: true, checkOut: true, workingHours: true, status: true },
  })
  return rows.map((r) => ({ ...r, workingHours: r.workingHours ? Number(r.workingHours) : null }))
}

export async function getMonthlySummary(employeeId: string, month: number, year: number) {
  const start = startOfMonth(new Date(year, month - 1, 1))
  const end = endOfMonth(start)

  const records = await prisma.attendance.findMany({
    where: { employeeId, date: { gte: start, lte: end } },
  })

  return {
    present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
    late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
    absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
    leave: records.filter((r) => r.status === AttendanceStatus.LEAVE).length,
    totalHours: records.reduce((sum, r) => sum + Number(r.workingHours ?? 0), 0),
  }
}

export async function listTodayTeamAttendance(employeeIds: string[]) {
  if (employeeIds.length === 0) return []
  return prisma.attendance.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, profileImageUrl: true } },
    },
  })
}

export async function listScopedEmployeeIds(scope: "all" | "team", managerEmployeeId?: string) {
  if (scope === "all") {
    const employees = await prisma.employee.findMany({ select: { id: true } })
    return employees.map((e) => e.id)
  }
  if (!managerEmployeeId) return []
  const reports = await prisma.employee.findMany({ where: { managerId: managerEmployeeId }, select: { id: true } })
  return reports.map((e) => e.id)
}
