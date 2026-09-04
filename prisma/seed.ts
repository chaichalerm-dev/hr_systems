/**
 * HRFlow demo seed data.
 *
 * Builds a full org: 1 admin, 2 HR, 3 managers, 20 employees across 4
 * departments, plus ~30 days of attendance, leave balances/requests with
 * approval trails, and two payroll runs (one paid, one in progress).
 *
 * All seeded users share their role's demo password (see .env.example /
 * README) so any account can be used to explore that role's permissions,
 * not just the four flagship demo logins.
 */
import {
  AdjustmentType,
  ApprovalDecision,
  ApprovalLevel,
  AttendanceStatus,
  EmploymentType,
  LeaveRequestStatus,
  PayrollStatus,
  PrismaClient,
  Role,
} from "@prisma/client"
import bcrypt from "bcryptjs"

import { calculateLateMinutes, calculateWorkingHours, isLateCheckIn } from "../src/server/services/attendance-rules"
import { calculateLeaveDays } from "../src/server/services/leave-rules"
import { calculatePayroll } from "../src/server/services/payroll-engine"
import { COMPANY_INFO, DEFAULT_ATTENDANCE_RULES, DEFAULT_PAYROLL_RULES, LEAVE_TYPE_SEED } from "../src/lib/constants"

const prisma = new PrismaClient()

const DEMO_PASSWORDS: Record<Role, string> = {
  ADMIN: process.env.DEMO_ADMIN_PASSWORD ?? "Admin@12345",
  HR: process.env.DEMO_HR_PASSWORD ?? "Hr@12345",
  MANAGER: process.env.DEMO_MANAGER_PASSWORD ?? "Manager@12345",
  EMPLOYEE: process.env.DEMO_EMPLOYEE_PASSWORD ?? "Employee@12345",
}

const BANKS = ["Kasikornbank", "Bangkok Bank", "Siam Commercial Bank", "Krungthai Bank", "TMBThanachart Bank"]
const DISTRICTS = ["Watthana", "Khlong Toei", "Bang Rak", "Huai Khwang", "Chatuchak", "Lat Phrao", "Bang Na", "Suan Luang"]
const RELATIONS = ["Spouse", "Parent", "Sibling", "Friend"]

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length]
}

function slugEmail(firstName: string, lastName: string): string {
  return `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, "") + "@hrflow.demo"
}

function pad4(n: number): string {
  return String(n).padStart(4, "0")
}

interface EmployeeSeed {
  key: string
  firstName: string
  lastName: string
  email?: string // override for the four flagship demo accounts
  role: Role
  departmentKey: string
  positionTitle: string
  managerKey?: string
  salary: number
  startDate: string
  employmentType?: EmploymentType
  commissionEligible?: boolean
}

const DEPARTMENTS = [
  { key: "ENG", name: "Engineering", code: "ENG" },
  { key: "HR", name: "Human Resources", code: "HR" },
  { key: "SAL", name: "Sales & Marketing", code: "SAL" },
  { key: "FIN", name: "Finance & Accounting", code: "FIN" },
] as const

const POSITIONS: { departmentKey: string; title: string }[] = [
  { departmentKey: "ENG", title: "Engineering Manager" },
  { departmentKey: "ENG", title: "Senior Software Engineer" },
  { departmentKey: "ENG", title: "Software Engineer" },
  { departmentKey: "ENG", title: "QA Engineer" },
  { departmentKey: "HR", title: "HR Manager" },
  { departmentKey: "HR", title: "HR Officer" },
  { departmentKey: "HR", title: "Recruiter" },
  { departmentKey: "HR", title: "System Administrator" },
  { departmentKey: "SAL", title: "Sales Manager" },
  { departmentKey: "SAL", title: "Sales Executive" },
  { departmentKey: "SAL", title: "Marketing Specialist" },
  { departmentKey: "FIN", title: "Finance Manager" },
  { departmentKey: "FIN", title: "Accountant" },
  { departmentKey: "FIN", title: "Payroll Specialist" },
]

const EMPLOYEES: EmployeeSeed[] = [
  { key: "admin", firstName: "Somsak", lastName: "Anantasuk", email: "admin@hrflow.demo", role: Role.ADMIN, departmentKey: "HR", positionTitle: "System Administrator", salary: 65000, startDate: "2019-01-07" },

  { key: "hrManager", firstName: "Suda", lastName: "Boonmee", email: "hr@hrflow.demo", role: Role.HR, departmentKey: "HR", positionTitle: "HR Manager", salary: 68000, startDate: "2019-03-11" },
  { key: "hrOfficer", firstName: "Patcharin", lastName: "Yodsuwan", role: Role.HR, departmentKey: "HR", positionTitle: "HR Officer", managerKey: "hrManager", salary: 32000, startDate: "2021-06-01" },

  { key: "engManager", firstName: "Wichai", lastName: "Saetang", email: "manager@hrflow.demo", role: Role.MANAGER, departmentKey: "ENG", positionTitle: "Engineering Manager", salary: 85000, startDate: "2019-02-18" },
  { key: "salManager", firstName: "Kittipong", lastName: "Wongsawat", role: Role.MANAGER, departmentKey: "SAL", positionTitle: "Sales Manager", salary: 78000, startDate: "2019-05-20" },
  { key: "finManager", firstName: "Areeya", lastName: "Phromsri", role: Role.MANAGER, departmentKey: "FIN", positionTitle: "Finance Manager", salary: 80000, startDate: "2019-04-15" },

  // Engineering
  { key: "e1", firstName: "Nattaya", lastName: "Suksawat", email: "employee@hrflow.demo", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Senior Software Engineer", managerKey: "engManager", salary: 55000, startDate: "2020-08-10" },
  { key: "e2", firstName: "Anucha", lastName: "Thongdee", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Software Engineer", managerKey: "engManager", salary: 38000, startDate: "2022-01-17" },
  { key: "e3", firstName: "Piyanuch", lastName: "Rattanakul", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Software Engineer", managerKey: "engManager", salary: 39000, startDate: "2021-11-02" },
  { key: "e4", firstName: "Chatchai", lastName: "Intharaphan", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Software Engineer", managerKey: "engManager", salary: 37500, startDate: "2023-02-06" },
  { key: "e5", firstName: "Waraporn", lastName: "Chaiyasit", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "QA Engineer", managerKey: "engManager", salary: 34000, startDate: "2022-09-19" },
  { key: "e6", firstName: "Sarawut", lastName: "Meesuk", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Software Engineer", managerKey: "engManager", salary: 38500, startDate: "2023-06-12" },
  { key: "e7", firstName: "David", lastName: "Kim", role: Role.EMPLOYEE, departmentKey: "ENG", positionTitle: "Senior Software Engineer", managerKey: "engManager", salary: 58000, startDate: "2021-03-29" },

  // Sales & Marketing
  { key: "e8", firstName: "Thanapon", lastName: "Ruangrit", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Sales Executive", managerKey: "salManager", salary: 28000, startDate: "2021-07-05", commissionEligible: true },
  { key: "e9", firstName: "Kanokwan", lastName: "Sirisak", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Sales Executive", managerKey: "salManager", salary: 28000, startDate: "2022-04-11", commissionEligible: true },
  { key: "e10", firstName: "Prasert", lastName: "Kulwong", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Sales Executive", managerKey: "salManager", salary: 29000, startDate: "2023-01-23", commissionEligible: true },
  { key: "e11", firstName: "Rungnapa", lastName: "Thepwong", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Marketing Specialist", managerKey: "salManager", salary: 32000, startDate: "2022-08-15" },
  { key: "e12", firstName: "James", lastName: "Anderson", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Sales Executive", managerKey: "salManager", salary: 30000, startDate: "2020-11-09", commissionEligible: true },
  { key: "e13", firstName: "Emily", lastName: "Carter", role: Role.EMPLOYEE, departmentKey: "SAL", positionTitle: "Marketing Specialist", managerKey: "salManager", salary: 33000, startDate: "2021-10-04" },

  // Finance & Accounting
  { key: "e14", firstName: "Nirut", lastName: "Chaisri", role: Role.EMPLOYEE, departmentKey: "FIN", positionTitle: "Accountant", managerKey: "finManager", salary: 33000, startDate: "2020-06-22" },
  { key: "e15", firstName: "Sirinya", lastName: "Panyawong", role: Role.EMPLOYEE, departmentKey: "FIN", positionTitle: "Accountant", managerKey: "finManager", salary: 33500, startDate: "2022-02-14" },
  { key: "e16", firstName: "Malee", lastName: "Rojjanasukchai", role: Role.EMPLOYEE, departmentKey: "FIN", positionTitle: "Payroll Specialist", managerKey: "finManager", salary: 35000, startDate: "2021-09-27" },
  { key: "e17", firstName: "Ekachai", lastName: "Boonyarit", role: Role.EMPLOYEE, departmentKey: "FIN", positionTitle: "Accountant", managerKey: "finManager", salary: 32500, startDate: "2023-05-08" },

  // HR
  { key: "e18", firstName: "Duangjai", lastName: "Wattana", role: Role.EMPLOYEE, departmentKey: "HR", positionTitle: "Recruiter", managerKey: "hrManager", salary: 29000, startDate: "2022-06-20" },
  { key: "e19", firstName: "Pichit", lastName: "Sangthong", role: Role.EMPLOYEE, departmentKey: "HR", positionTitle: "HR Officer", managerKey: "hrManager", salary: 30000, startDate: "2023-03-13" },
  { key: "e20", firstName: "Ratree", lastName: "Kaewmanee", role: Role.EMPLOYEE, departmentKey: "HR", positionTitle: "Recruiter", managerKey: "hrManager", salary: 29500, startDate: "2021-12-01" },
]

async function main() {
  console.log(`Seeding ${COMPANY_INFO.name} demo data...`)

  await prisma.companySetting.upsert({
    where: { key: "ATTENDANCE_RULES" },
    create: { key: "ATTENDANCE_RULES", value: DEFAULT_ATTENDANCE_RULES },
    update: { value: DEFAULT_ATTENDANCE_RULES },
  })
  await prisma.companySetting.upsert({
    where: { key: "PAYROLL_RULES" },
    create: { key: "PAYROLL_RULES", value: DEFAULT_PAYROLL_RULES },
    update: { value: DEFAULT_PAYROLL_RULES },
  })
  await prisma.companySetting.upsert({
    where: { key: "COMPANY_INFO" },
    create: { key: "COMPANY_INFO", value: COMPANY_INFO },
    update: { value: COMPANY_INFO },
  })

  const departmentByKey = new Map<string, string>()
  for (const dept of DEPARTMENTS) {
    const record = await prisma.department.upsert({
      where: { code: dept.code },
      create: { name: dept.name, code: dept.code },
      update: { name: dept.name },
    })
    departmentByKey.set(dept.key, record.id)
  }

  const positionByKey = new Map<string, string>()
  for (const pos of POSITIONS) {
    const departmentId = departmentByKey.get(pos.departmentKey)!
    const record = await prisma.position.upsert({
      where: { title_departmentId: { title: pos.title, departmentId } },
      create: { title: pos.title, departmentId },
      update: {},
    })
    positionByKey.set(`${pos.departmentKey}:${pos.title}`, record.id)
  }

  const leaveTypeByName = new Map<string, string>()
  for (const lt of LEAVE_TYPE_SEED) {
    const record = await prisma.leaveType.upsert({
      where: { name: lt.name },
      create: { name: lt.name, defaultDaysPerYear: lt.defaultDaysPerYear, isPaid: lt.isPaid },
      update: {},
    })
    leaveTypeByName.set(lt.name, record.id)
  }

  const employeeIdByKey = new Map<string, string>()
  const userIdByKey = new Map<string, string>()
  let employeeCounter = 1

  for (const emp of EMPLOYEES) {
    const departmentId = departmentByKey.get(emp.departmentKey)!
    const positionId = positionByKey.get(`${emp.departmentKey}:${emp.positionTitle}`)!
    const managerId = emp.managerKey ? employeeIdByKey.get(emp.managerKey) ?? null : null
    const email = emp.email ?? slugEmail(emp.firstName, emp.lastName)
    const employeeCode = `EMP${pad4(employeeCounter++)}`
    const index = employeeCounter

    const passwordHash = await bcrypt.hash(DEMO_PASSWORDS[emp.role], 10)

    const user = await prisma.user.upsert({
      where: { email },
      create: { email, passwordHash, role: emp.role },
      update: { passwordHash, role: emp.role },
    })

    const employee = await prisma.employee.upsert({
      where: { email },
      create: {
        employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email,
        phone: `08${(index % 10)}-${String(100 + index).slice(0, 3)}-${String(1000 + index * 7).slice(0, 4)}`,
        departmentId,
        positionId,
        employmentType: emp.employmentType ?? EmploymentType.FULL_TIME,
        salary: emp.salary,
        startDate: new Date(emp.startDate),
        managerId,
        userId: user.id,
        emergencyContactName: `${pick(["Somjai", "Preecha", "Wanida", "Surachai"], index)} ${emp.lastName}`,
        emergencyContactPhone: `09${(index % 10)}-${String(200 + index).slice(0, 3)}-${String(2000 + index * 3).slice(0, 4)}`,
        emergencyContactRelation: pick(RELATIONS, index),
        addressLine1: `${100 + index} Sukhumvit Soi ${10 + (index % 40)}`,
        city: pick(DISTRICTS, index),
        province: "Bangkok",
        postalCode: `10${100 + (index % 90)}`,
        country: "Thailand",
        bankName: pick(BANKS, index),
        bankAccountNumber: `${100 + index}-${1000 + index}-${10000 + index}`,
        taxId: `1${String(1000000000000 + index).slice(0, 12)}`,
        socialSecurityNo: `${1000000000 + index}`,
      },
      update: { managerId, userId: user.id },
    })

    employeeIdByKey.set(emp.key, employee.id)
    userIdByKey.set(emp.key, user.id)
  }
  console.log(`Created ${EMPLOYEES.length} employees/users.`)

  // ---- Leave balances (current year, every employee x every leave type) ----
  const currentYear = new Date().getFullYear()
  for (const emp of EMPLOYEES) {
    const employeeId = employeeIdByKey.get(emp.key)!
    for (const lt of LEAVE_TYPE_SEED) {
      const leaveTypeId = leaveTypeByName.get(lt.name)!
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year: currentYear } },
        create: {
          employeeId,
          leaveTypeId,
          year: currentYear,
          totalDays: lt.defaultDaysPerYear,
          usedDays: 0,
          remainingDays: lt.defaultDaysPerYear,
        },
        update: {},
      })
    }
  }

  // ---- Sample leave requests with an approval trail ----
  const today = new Date()
  const annualLeaveId = leaveTypeByName.get("Annual Leave")!
  const sickLeaveId = leaveTypeByName.get("Sick Leave")!
  const personalLeaveId = leaveTypeByName.get("Personal Leave")!

  type LeaveScenario = {
    employeeKey: string
    approverKey: string
    leaveTypeId: string
    daysAgoStart: number
    span: number
    reason: string
    finalStatus: LeaveRequestStatus
    rejectComment?: string
  }

  const leaveScenarios: LeaveScenario[] = [
    { employeeKey: "e1", approverKey: "engManager", leaveTypeId: annualLeaveId, daysAgoStart: 20, span: 2, reason: "Family trip to Chiang Mai", finalStatus: LeaveRequestStatus.APPROVED },
    { employeeKey: "e2", approverKey: "engManager", leaveTypeId: sickLeaveId, daysAgoStart: 10, span: 0, reason: "Flu, resting at home", finalStatus: LeaveRequestStatus.APPROVED },
    { employeeKey: "e3", approverKey: "engManager", leaveTypeId: annualLeaveId, daysAgoStart: -5, span: 1, reason: "Wedding anniversary", finalStatus: LeaveRequestStatus.PENDING_MANAGER },
    { employeeKey: "e8", approverKey: "salManager", leaveTypeId: personalLeaveId, daysAgoStart: -8, span: 0, reason: "Moving to a new apartment", finalStatus: LeaveRequestStatus.PENDING_HR },
    { employeeKey: "e9", approverKey: "salManager", leaveTypeId: annualLeaveId, daysAgoStart: 15, span: 3, reason: "Songkran holiday extension", finalStatus: LeaveRequestStatus.APPROVED },
    { employeeKey: "e14", approverKey: "finManager", leaveTypeId: sickLeaveId, daysAgoStart: 6, span: 1, reason: "Dental surgery recovery", finalStatus: LeaveRequestStatus.REJECTED, rejectComment: "Please provide a medical certificate for multi-day sick leave." },
    { employeeKey: "e18", approverKey: "hrManager", leaveTypeId: annualLeaveId, daysAgoStart: 25, span: 1, reason: "Personal errands", finalStatus: LeaveRequestStatus.APPROVED },
    { employeeKey: "e11", approverKey: "salManager", leaveTypeId: personalLeaveId, daysAgoStart: 3, span: 0, reason: "Car in for repair", finalStatus: LeaveRequestStatus.CANCELLED },
  ]

  for (const scenario of leaveScenarios) {
    const employeeId = employeeIdByKey.get(scenario.employeeKey)!
    const approverUserId = userIdByKey.get(scenario.approverKey)!
    const hrUserId = userIdByKey.get("hrManager")!

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - scenario.daysAgoStart)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + scenario.span)

    const days = calculateLeaveDays(startDate, endDate)

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: scenario.leaveTypeId,
        startDate,
        endDate,
        days,
        reason: scenario.reason,
        status: scenario.finalStatus,
      },
    })

    if (scenario.finalStatus === LeaveRequestStatus.PENDING_HR || scenario.finalStatus === LeaveRequestStatus.APPROVED) {
      await prisma.leaveApproval.create({
        data: {
          leaveRequestId: leaveRequest.id,
          approverId: approverUserId,
          level: ApprovalLevel.MANAGER,
          decision: ApprovalDecision.APPROVED,
          comment: "Approved — team coverage confirmed.",
        },
      })
    }

    if (scenario.finalStatus === LeaveRequestStatus.APPROVED) {
      await prisma.leaveApproval.create({
        data: {
          leaveRequestId: leaveRequest.id,
          approverId: hrUserId,
          level: ApprovalLevel.HR,
          decision: ApprovalDecision.APPROVED,
          comment: "Leave balance verified, approved.",
        },
      })

      const balance = await prisma.leaveBalance.findUnique({
        where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: scenario.leaveTypeId, year: currentYear } },
      })
      if (balance) {
        const usedDays = Number(balance.usedDays) + days
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: { usedDays, remainingDays: Number(balance.totalDays) - usedDays },
        })
      }
    }

    if (scenario.finalStatus === LeaveRequestStatus.REJECTED) {
      await prisma.leaveApproval.create({
        data: {
          leaveRequestId: leaveRequest.id,
          approverId: approverUserId,
          level: ApprovalLevel.MANAGER,
          decision: ApprovalDecision.REJECTED,
          comment: scenario.rejectComment ?? "Rejected.",
        },
      })
    }
  }
  console.log(`Created ${leaveScenarios.length} sample leave requests.`)

  // ---- Attendance for the last ~30 calendar days (weekdays only) ----
  const rules = DEFAULT_ATTENDANCE_RULES
  const attendanceRows: Array<{
    employeeId: string
    date: Date
    checkIn: Date | null
    checkOut: Date | null
    workingHours: number | null
    status: AttendanceStatus
    checkInLatitude: number | null
    checkInLongitude: number | null
    checkInIpAddress: string | null
    checkInDevice: string | null
    checkOutLatitude: number | null
    checkOutLongitude: number | null
    checkOutIpAddress: string | null
    checkOutDevice: string | null
  }> = []

  const OFFICE_LAT = 13.7563
  const OFFICE_LNG = 100.5018
  const DEVICES = ["Chrome on Windows", "Safari on macOS", "Chrome on Android", "Edge on Windows"]

  let seedRandomState = 42
  function seededRandom() {
    seedRandomState = (seedRandomState * 1103515245 + 12345) & 0x7fffffff
    return seedRandomState / 0x7fffffff
  }

  for (const emp of EMPLOYEES) {
    const employeeId = employeeIdByKey.get(emp.key)!

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) continue // weekends: no record

      const roll = seededRandom()
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)

      if (roll < 0.04) {
        // Absent
        attendanceRows.push({
          employeeId,
          date: dateOnly,
          checkIn: null,
          checkOut: null,
          workingHours: null,
          status: AttendanceStatus.ABSENT,
          checkInLatitude: null,
          checkInLongitude: null,
          checkInIpAddress: null,
          checkInDevice: null,
          checkOutLatitude: null,
          checkOutLongitude: null,
          checkOutIpAddress: null,
          checkOutDevice: null,
        })
        continue
      }

      if (roll < 0.06) {
        // On approved leave that day
        attendanceRows.push({
          employeeId,
          date: dateOnly,
          checkIn: null,
          checkOut: null,
          workingHours: null,
          status: AttendanceStatus.LEAVE,
          checkInLatitude: null,
          checkInLongitude: null,
          checkInIpAddress: null,
          checkInDevice: null,
          checkOutLatitude: null,
          checkOutLongitude: null,
          checkOutIpAddress: null,
          checkOutDevice: null,
        })
        continue
      }

      const checkInOffsetMinutes = Math.floor(seededRandom() * 45) - 10 // -10..+34 minutes from 09:00
      const checkIn = new Date(dateOnly)
      checkIn.setHours(9, 0, 0, 0)
      checkIn.setMinutes(checkIn.getMinutes() + checkInOffsetMinutes)

      const checkOutOffsetMinutes = Math.floor(seededRandom() * 60) - 10 // -10..+49 minutes from 18:00
      const checkOut = new Date(dateOnly)
      checkOut.setHours(18, 0, 0, 0)
      checkOut.setMinutes(checkOut.getMinutes() + checkOutOffsetMinutes)

      const status = isLateCheckIn(checkIn, rules) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
      const workingHours = calculateWorkingHours(checkIn, checkOut)
      const device = pick(DEVICES, Math.floor(seededRandom() * 100))

      attendanceRows.push({
        employeeId,
        date: dateOnly,
        checkIn,
        checkOut,
        workingHours,
        status,
        checkInLatitude: OFFICE_LAT + (seededRandom() - 0.5) * 0.002,
        checkInLongitude: OFFICE_LNG + (seededRandom() - 0.5) * 0.002,
        checkInIpAddress: `203.0.113.${1 + Math.floor(seededRandom() * 200)}`,
        checkInDevice: device,
        checkOutLatitude: OFFICE_LAT + (seededRandom() - 0.5) * 0.002,
        checkOutLongitude: OFFICE_LNG + (seededRandom() - 0.5) * 0.002,
        checkOutIpAddress: `203.0.113.${1 + Math.floor(seededRandom() * 200)}`,
        checkOutDevice: device,
      })
    }
  }

  await prisma.attendance.createMany({ data: attendanceRows, skipDuplicates: true })
  console.log(`Created ${attendanceRows.length} attendance records.`)

  // ---- Payroll: previous month (PAID) and current month (CALCULATED) ----
  const payrollRules = DEFAULT_PAYROLL_RULES
  const now = new Date()
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  async function buildPayrollRun(month: number, year: number, status: PayrollStatus, issuePayslips: boolean) {
    const run = await prisma.payrollRun.upsert({
      where: { month_year: { month, year } },
      create: {
        month,
        year,
        status,
        createdById: userIdByKey.get("hrManager")!,
        approvedById: status === PayrollStatus.PAID ? userIdByKey.get("admin")! : null,
        paidAt: status === PayrollStatus.PAID ? new Date(year, month, 5) : null,
      },
      update: { status },
    })

    const periodStart = new Date(year, month - 1, 1)
    const periodEnd = new Date(year, month, 0)

    for (const emp of EMPLOYEES) {
      const employeeId = employeeIdByKey.get(emp.key)!

      const periodAttendance = await prisma.attendance.findMany({
        where: { employeeId, date: { gte: periodStart, lte: periodEnd } },
      })
      const absentDays = periodAttendance.filter((a) => a.status === AttendanceStatus.ABSENT).length
      const lateMinutesTotal = periodAttendance
        .filter((a) => a.status === AttendanceStatus.LATE && a.checkIn)
        .reduce((sum, a) => sum + calculateLateMinutes(a.checkIn!, rules), 0)

      const allowance = 1500 // standard transport/meal allowance
      const bonus = emp.key === "engManager" || emp.key === "salManager" || emp.key === "finManager" ? 5000 : 0
      const commission = emp.commissionEligible ? 3200 : 0

      const result = calculatePayroll({
        baseSalary: emp.salary,
        allowance,
        bonus,
        commission,
        absentDays,
        lateMinutesTotal,
        rules: payrollRules,
      })

      const item = await prisma.payrollItem.upsert({
        where: { payrollRunId_employeeId: { payrollRunId: run.id, employeeId } },
        create: {
          payrollRunId: run.id,
          employeeId,
          baseSalary: result.baseSalary,
          overtime: result.overtime,
          allowance: result.allowance,
          bonus: result.bonus,
          commission: result.commission,
          otherIncome: result.otherIncome,
          unpaidLeaveDeduction: result.unpaidLeaveDeduction,
          absenceDeduction: result.absenceDeduction,
          lateDeduction: result.lateDeduction,
          socialSecurity: result.socialSecurity,
          withholdingTax: result.withholdingTax,
          otherDeductions: result.otherDeductions,
          grossIncome: result.grossIncome,
          totalDeductions: result.totalDeductions,
          netSalary: result.netSalary,
        },
        update: {},
      })

      if (issuePayslips) {
        await prisma.payslip.upsert({
          where: { payrollItemId: item.id },
          create: { payrollItemId: item.id },
          update: {},
        })
      }
    }
  }

  await buildPayrollRun(previousMonthDate.getMonth() + 1, previousMonthDate.getFullYear(), PayrollStatus.PAID, true)
  await buildPayrollRun(now.getMonth() + 1, now.getFullYear(), PayrollStatus.CALCULATED, false)
  console.log("Created payroll runs for the previous (paid) and current (calculated) month.")

  // ---- A couple of payroll adjustments on the paid run, for the UI to show ----
  const paidRun = await prisma.payrollRun.findUnique({
    where: { month_year: { month: previousMonthDate.getMonth() + 1, year: previousMonthDate.getFullYear() } },
  })
  if (paidRun) {
    const e1Item = await prisma.payrollItem.findFirst({
      where: { payrollRunId: paidRun.id, employeeId: employeeIdByKey.get("e1") },
    })
    if (e1Item) {
      await prisma.payrollAdjustment.create({
        data: {
          payrollItemId: e1Item.id,
          type: AdjustmentType.INCOME,
          label: "Project completion bonus",
          amount: 2000,
          note: "Shipped the Q2 reporting module ahead of schedule.",
        },
      })
    }
  }

  // ---- Audit log entries for demo visibility ----
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: userIdByKey.get("hrManager")!,
        action: "EMPLOYEE_CREATED",
        entity: "Employee",
        entityId: employeeIdByKey.get("e1")!,
        metadata: { employeeCode: "EMP0007" },
      },
      {
        actorId: userIdByKey.get("engManager")!,
        action: "LEAVE_APPROVED",
        entity: "LeaveRequest",
        entityId: employeeIdByKey.get("e1")!,
        metadata: { note: "Manager-level approval" },
      },
      {
        actorId: userIdByKey.get("hrManager")!,
        action: "PAYROLL_GENERATED",
        entity: "PayrollRun",
        entityId: paidRun?.id ?? "unknown",
        metadata: { month: previousMonthDate.getMonth() + 1, year: previousMonthDate.getFullYear() },
      },
      {
        actorId: userIdByKey.get("admin")!,
        action: "PAYROLL_APPROVED",
        entity: "PayrollRun",
        entityId: paidRun?.id ?? "unknown",
        metadata: {},
      },
    ],
  })

  console.log("Seed complete.")
  console.log("")
  console.log("Demo logins (see README for the full roster):")
  console.log(`  Admin:    admin@hrflow.demo    / ${DEMO_PASSWORDS.ADMIN}`)
  console.log(`  HR:       hr@hrflow.demo       / ${DEMO_PASSWORDS.HR}`)
  console.log(`  Manager:  manager@hrflow.demo  / ${DEMO_PASSWORDS.MANAGER}`)
  console.log(`  Employee: employee@hrflow.demo / ${DEMO_PASSWORDS.EMPLOYEE}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
