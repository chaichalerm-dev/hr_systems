import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  FileBarChart,
  ShieldCheck,
  Settings,
  ReceiptText,
  type LucideIcon,
} from "lucide-react"
import { Role } from "@prisma/client"

import type { Dictionary } from "@/i18n/dictionaries/en"

/** ใช้ชื่อข้อความใน dictionary.nav เพื่อแสดงชื่อเมนูตามภาษาที่เลือก
 * Look up the menu label in dictionary.nav for the selected language.
 */
type NavLabelKey = keyof Dictionary["nav"]

export type NavGroupKey = "groupOverview" | "groupWorkforce" | "groupPayroll" | "groupAdmin"

export interface NavItem {
  href: string
  labelKey: NavLabelKey
  icon: LucideIcon
  roles: Role[]
  group: NavGroupKey
}

export interface NavGroup {
  key: NavGroupKey
  items: NavItem[]
}

// เรียงเมนูตามการใช้งาน: ภาพรวม งานบุคคล เงินเดือน แล้วจึงเครื่องมือผู้ดูแล
// Show overview, workforce, payroll, and administration in that order.
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE], group: "groupOverview" },

  { href: "/employees", labelKey: "employees", icon: Users, roles: [Role.ADMIN, Role.HR, Role.MANAGER], group: "groupWorkforce" },
  { href: "/attendance", labelKey: "attendance", icon: CalendarCheck, roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE], group: "groupWorkforce" },
  { href: "/leave", labelKey: "leave", icon: CalendarDays, roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE], group: "groupWorkforce" },

  { href: "/payroll", labelKey: "payroll", icon: Banknote, roles: [Role.ADMIN, Role.HR], group: "groupPayroll" },
  { href: "/payslips", labelKey: "payslips", icon: ReceiptText, roles: [Role.ADMIN, Role.HR, Role.EMPLOYEE], group: "groupPayroll" },

  { href: "/reports", labelKey: "reports", icon: FileBarChart, roles: [Role.ADMIN, Role.HR], group: "groupAdmin" },
  { href: "/audit-log", labelKey: "auditLog", icon: ShieldCheck, roles: [Role.ADMIN, Role.HR], group: "groupAdmin" },
  { href: "/settings", labelKey: "settings", icon: Settings, roles: [Role.ADMIN], group: "groupAdmin" },
]

const GROUP_ORDER: NavGroupKey[] = ["groupOverview", "groupWorkforce", "groupPayroll", "groupAdmin"]

/** จัดกลุ่มเฉพาะเมนูที่บทบาทนี้ใช้ได้ และซ่อนกลุ่มที่ไม่มีรายการ
 * Group the pages allowed for this role and omit empty groups.
 */
export function navGroupsForRole(role: Role): NavGroup[] {
  const visible = NAV_ITEMS.filter((item) => item.roles.includes(role))
  return GROUP_ORDER.map((key) => ({ key, items: visible.filter((item) => item.group === key) })).filter(
    (g) => g.items.length > 0
  )
}
