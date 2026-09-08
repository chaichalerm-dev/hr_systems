import type { Role } from "@prisma/client"
import type { GuideTopic } from "./types"

const everyone: Role[] = ["ADMIN", "HR", "MANAGER", "EMPLOYEE"]
const managers: Role[] = ["ADMIN", "HR", "MANAGER"]
const hr: Role[] = ["ADMIN", "HR"]

// แสดงเฉพาะหัวข้อที่ตรงกับบทบาท ส่วนหน้าทำงานยังตรวจสิทธิ์ของตนเองตามเดิม
// Filter guide topics by role; destination pages still enforce their own authorization.
export const GUIDE_TOPICS: GuideTopic[] = [
  { id: "basics", category: "basics", roles: everyone, href: "/dashboard" },
  { id: "navigation", category: "basics", roles: everyone, href: "/dashboard" },
  { id: "dashboard", category: "basics", roles: everyone, href: "/dashboard" },
  { id: "glossary", category: "basics", roles: everyone },
  { id: "profile", category: "personal", roles: everyone, href: "/profile", needsProfile: true },
  { id: "attendance", category: "personal", roles: everyone, href: "/attendance", needsProfile: true },
  { id: "leaveRequest", category: "personal", roles: everyone, href: "/leave", needsProfile: true },
  { id: "leaveTracking", category: "personal", roles: everyone, href: "/leave", needsProfile: true },
  { id: "payslips", category: "personal", roles: everyone, href: "/payslips", needsProfile: true },
  { id: "tax", category: "personal", roles: everyone, href: "/payslips", needsProfile: true },
  { id: "teamAttendance", category: "team", roles: managers, href: "/attendance" },
  { id: "employeeSearch", category: "team", roles: managers, href: "/employees" },
  { id: "leaveApprovals", category: "team", roles: managers, href: "/leave" },
  { id: "employeeCreate", category: "management", roles: hr, href: "/employees/new" },
  { id: "employeeEdit", category: "management", roles: hr, href: "/employees" },
  { id: "payrollCreate", category: "management", roles: hr, href: "/payroll" },
  { id: "payrollAdjust", category: "management", roles: hr, href: "/payroll" },
  { id: "payrollApprove", category: "management", roles: hr, href: "/payroll" },
  { id: "reports", category: "management", roles: hr, href: "/reports" },
  { id: "audit", category: "management", roles: hr, href: "/audit-log" },
  { id: "attendanceSettings", category: "admin", roles: ["ADMIN"], href: "/settings" },
  { id: "payrollSettings", category: "admin", roles: ["ADMIN"], href: "/settings" },
  { id: "troubleshooting", category: "basics", roles: everyone },
]

export function guideTopicsForRole(role: Role) {
  return GUIDE_TOPICS.filter((topic) => topic.roles.includes(role))
}
