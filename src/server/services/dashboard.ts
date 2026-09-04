import "server-only"

import { AttendanceStatus, EmploymentStatus, LeaveRequestStatus, PayrollStatus } from "@prisma/client"
import { endOfDay, format, startOfDay, subDays } from "date-fns"

import { prisma } from "@/db/client"

export interface AttendanceTrendPoint {
  date: string
  present: number
  late: number
  absent: number
}

export interface DepartmentHeadcount {
  department: string
  count: number
}

export interface LeaveStat {
  leaveType: string
  days: number
}

export interface PayrollTrendPoint {
  period: string
  totalNet: number
}

async function buildAttendanceTrend(employeeIds?: string[]): Promise<AttendanceTrendPoint[]> {
  const start = startOfDay(subDays(new Date(), 13))
  const end = endOfDay(new Date())

  const rows = await prisma.attendance.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(employeeIds ? { employeeId: { in: employeeIds } } : {}),
    },
    select: { date: true, status: true },
  })

  const buckets = new Map<string, AttendanceTrendPoint>()
  for (let i = 13; i >= 0; i--) {
    const key = format(subDays(new Date(), i), "MMM d")
    buckets.set(key, { date: key, present: 0, late: 0, absent: 0 })
  }

  for (const row of rows) {
    const key = format(row.date, "MMM d")
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (row.status === AttendanceStatus.PRESENT) bucket.present += 1
    else if (row.status === AttendanceStatus.LATE) bucket.late += 1
    else if (row.status === AttendanceStatus.ABSENT) bucket.absent += 1
  }

  return Array.from(buckets.values())
}

export interface OrgDashboardMetrics {
  totalEmployees: number
  activeEmployees: number
  presentToday: number
  lateToday: number
  onLeaveToday: number
  pendingLeaveApprovals: number
  monthlyPayrollCost: number
  departmentHeadcount: DepartmentHeadcount[]
  attendanceTrend: AttendanceTrendPoint[]
  leaveStats: LeaveStat[]
  payrollTrend: PayrollTrendPoint[]
}

export async function getOrgDashboardMetrics(): Promise<OrgDashboardMetrics> {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  const [
    totalEmployees,
    activeEmployees,
    presentToday,
    lateToday,
    onLeaveToday,
    pendingLeaveApprovals,
    departments,
    currentPayrollRun,
    leaveRequests,
    leaveTypes,
    payrollRuns,
    attendanceTrend,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: EmploymentStatus.ACTIVE } }),
    prisma.attendance.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.PRESENT } }),
    prisma.attendance.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.LATE } }),
    prisma.attendance.count({ where: { date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.LEAVE } }),
    prisma.leaveRequest.count({
      where: { status: { in: [LeaveRequestStatus.PENDING_MANAGER, LeaveRequestStatus.PENDING_HR] } },
    }),
    prisma.department.findMany({ include: { _count: { select: { employees: true } } } }),
    prisma.payrollRun.findFirst({
      where: { year: today.getFullYear(), month: today.getMonth() + 1 },
      include: { items: { select: { netSalary: true } } },
    }),
    prisma.leaveRequest.findMany({
      where: { status: LeaveRequestStatus.APPROVED },
      select: { days: true, leaveTypeId: true },
    }),
    prisma.leaveType.findMany(),
    prisma.payrollRun.findMany({
      where: { status: { in: [PayrollStatus.APPROVED, PayrollStatus.PAID] } },
      include: { items: { select: { netSalary: true } } },
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: 6,
    }),
    buildAttendanceTrend(),
  ])

  const monthlyPayrollCost =
    currentPayrollRun?.items.reduce((sum, item) => sum + Number(item.netSalary), 0) ?? 0

  const leaveTypeNameById = new Map(leaveTypes.map((lt) => [lt.id, lt.name]))
  const leaveStatsMap = new Map<string, number>()
  for (const request of leaveRequests) {
    const name = leaveTypeNameById.get(request.leaveTypeId) ?? "Other"
    leaveStatsMap.set(name, (leaveStatsMap.get(name) ?? 0) + Number(request.days))
  }

  return {
    totalEmployees,
    activeEmployees,
    presentToday,
    lateToday,
    onLeaveToday,
    pendingLeaveApprovals,
    monthlyPayrollCost,
    departmentHeadcount: departments.map((d) => ({ department: d.name, count: d._count.employees })),
    attendanceTrend,
    leaveStats: Array.from(leaveStatsMap.entries()).map(([leaveType, days]) => ({ leaveType, days })),
    payrollTrend: payrollRuns.map((run) => ({
      period: format(new Date(run.year, run.month - 1, 1), "MMM yyyy"),
      totalNet: run.items.reduce((sum, item) => sum + Number(item.netSalary), 0),
    })),
  }
}

export interface ManagerDashboardMetrics {
  teamSize: number
  presentToday: number
  lateToday: number
  onLeaveToday: number
  pendingApprovals: number
  attendanceTrend: AttendanceTrendPoint[]
}

export async function getManagerDashboardMetrics(managerEmployeeId: string): Promise<ManagerDashboardMetrics> {
  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)

  const reports = await prisma.employee.findMany({ where: { managerId: managerEmployeeId }, select: { id: true } })
  const reportIds = reports.map((r) => r.id)

  if (reportIds.length === 0) {
    return { teamSize: 0, presentToday: 0, lateToday: 0, onLeaveToday: 0, pendingApprovals: 0, attendanceTrend: [] }
  }

  const [presentToday, lateToday, onLeaveToday, pendingApprovals, attendanceTrend] = await Promise.all([
    prisma.attendance.count({
      where: { employeeId: { in: reportIds }, date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.PRESENT },
    }),
    prisma.attendance.count({
      where: { employeeId: { in: reportIds }, date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.LATE },
    }),
    prisma.attendance.count({
      where: { employeeId: { in: reportIds }, date: { gte: todayStart, lte: todayEnd }, status: AttendanceStatus.LEAVE },
    }),
    prisma.leaveRequest.count({
      where: { employeeId: { in: reportIds }, status: LeaveRequestStatus.PENDING_MANAGER },
    }),
    buildAttendanceTrend(reportIds),
  ])

  return { teamSize: reportIds.length, presentToday, lateToday, onLeaveToday, pendingApprovals, attendanceTrend }
}

export interface EmployeeDashboardData {
  todayStatus: AttendanceStatus | "NOT_CHECKED_IN"
  checkInTime: string | null
  checkOutTime: string | null
  leaveBalances: { leaveType: string; remaining: number; total: number }[]
  recentPayslipPeriod: string | null
}

export async function getEmployeeDashboardData(employeeId: string): Promise<EmployeeDashboardData> {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())
  const currentYear = new Date().getFullYear()

  const [todayAttendance, balances, latestPayslip] = await Promise.all([
    prisma.attendance.findFirst({ where: { employeeId, date: { gte: todayStart, lte: todayEnd } } }),
    prisma.leaveBalance.findMany({ where: { employeeId, year: currentYear }, include: { leaveType: true } }),
    prisma.payslip.findFirst({
      where: { payrollItem: { employeeId } },
      orderBy: { issuedAt: "desc" },
      include: { payrollItem: { include: { payrollRun: true } } },
    }),
  ])

  return {
    todayStatus: todayAttendance?.status ?? "NOT_CHECKED_IN",
    checkInTime: todayAttendance?.checkIn ? format(todayAttendance.checkIn, "HH:mm") : null,
    checkOutTime: todayAttendance?.checkOut ? format(todayAttendance.checkOut, "HH:mm") : null,
    leaveBalances: balances.map((b) => ({
      leaveType: b.leaveType.name,
      remaining: Number(b.remainingDays),
      total: Number(b.totalDays),
    })),
    recentPayslipPeriod: latestPayslip
      ? format(new Date(latestPayslip.payrollItem.payrollRun.year, latestPayslip.payrollItem.payrollRun.month - 1, 1), "MMMM yyyy")
      : null,
  }
}
