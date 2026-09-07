export const APP_NAME = "HRFlow"
export const APP_DESCRIPTION =
  "จัดการข้อมูลพนักงาน ลงเวลา การลา และเงินเดือนในที่เดียว / Manage people, attendance, leave, and payroll in one place."

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  HR: "HR Manager",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
}

// ค่าลงเวลาเริ่มต้นใช้ตอน seed และเมื่อฐานข้อมูลยังไม่มีค่า อ่านค่าปัจจุบันผ่าน company-settings.ts
// Use these defaults for seeding and as a fallback when CompanySetting has no attendance rules.
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

// ค่าคำนวณเงินเดือนตัวอย่าง ใช้กับ seed และเป็นค่าสำรองเมื่อยังไม่ได้ตั้งค่าในฐานข้อมูล
// Demo payroll defaults for seeding and fallback. See the README limitations before real use.
export const DEFAULT_PAYROLL_RULES = {
  socialSecurityRate: 0.05,
  socialSecurityMaxBase: 15000,
  withholdingTaxRate: 0.03,
  lateDeductionPerMinute: 10,
  absenceDeductionDivisor: 30, // เงินเดือนหาร 30 เป็นค่าจ้างรายวัน / Monthly salary divided by 30 gives daily pay.
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
