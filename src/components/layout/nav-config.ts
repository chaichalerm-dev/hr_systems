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

/** Key into `dictionary.nav`, so the label is translated at render time rather than baked in here. */
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

// Order here is display order: Overview first, then day-to-day workforce
// tasks, then Payroll, then admin/oversight tools last.
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

/** Items for this role, bucketed into groups (in display order); empty groups are omitted. */
export function navGroupsForRole(role: Role): NavGroup[] {
  const visible = NAV_ITEMS.filter((item) => item.roles.includes(role))
  return GROUP_ORDER.map((key) => ({ key, items: visible.filter((item) => item.group === key) })).filter(
    (g) => g.items.length > 0
  )
}
