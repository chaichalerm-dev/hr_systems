export const APP_NAME = "HRFlow"
export const APP_DESCRIPTION =
  "A modular HR management platform — employees, attendance, leave, and payroll in one place."

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  HR: "HR Manager",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
}

// Attendance rules. In a real deployment these would live in CompanySetting
// and be editable from an admin screen — kept as constants here for the
// portfolio build's seed/demo data, with CompanySetting.ATTENDANCE_RULES
// as the source of truth read at runtime (see src/server/services/attendance).
export const DEFAULT_ATTENDANCE_RULES = {
  workStartTime: "09:00",
  workEndTime: "18:00",
  gracePeriodMinutes: 15,
  standardWorkingHours: 8,
}

export const LEAVE_TYPE_SEED = [
  { name: "Annual Leave", defaultDaysPerYear: 10, isPaid: true },
  { name: "Sick Leave", defaultDaysPerYear: 30, isPaid: true },
  { name: "Personal Leave", defaultDaysPerYear: 3, isPaid: true },
  { name: "Unpaid Leave", defaultDaysPerYear: 0, isPaid: false },
] as const

// Demo-only payroll configuration. NOT verified against real Thai tax law —
// see README "Limitations" before using this for anything but a portfolio
// demo. Stored in CompanySetting so it's editable without a redeploy.
export const DEFAULT_PAYROLL_RULES = {
  socialSecurityRate: 0.05,
  socialSecurityMaxBase: 15000,
  withholdingTaxRate: 0.03,
  lateDeductionPerMinute: 10,
  absenceDeductionDivisor: 30, // monthly salary / 30 = 1 day's pay
}

export const COMPANY_INFO = {
  name: "HRFlow Demo Co., Ltd.",
  nameTh: "บริษัท เอชอาร์โฟลว์ เดโม จำกัด",
  address: "123 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand",
  taxId: "0-1055-00000-00-0",
  phone: "+66 2 000 0000",
  email: "hr@hrflow.demo",
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 10
