import type { Role } from "@prisma/client"

export type GuideCategory = "basics" | "personal" | "team" | "management" | "admin"
export type GuideTopicId =
  | "basics" | "navigation" | "dashboard" | "profile" | "attendance"
  | "leaveRequest" | "leaveTracking" | "payslips" | "tax" | "teamAttendance"
  | "employeeSearch" | "employeeCreate" | "employeeEdit" | "leaveApprovals"
  | "payrollCreate" | "payrollAdjust" | "payrollApprove" | "reports" | "audit"
  | "attendanceSettings" | "payrollSettings" | "troubleshooting" | "glossary"

export interface GuideCopy {
  title: string
  summary: string
  before: string
  steps: string[]
  result: string
  tips: string[]
}

export interface GuideTopic {
  id: GuideTopicId
  category: GuideCategory
  roles: Role[]
  href?: string
  needsProfile?: boolean
}

export type GuideContent = Record<GuideTopicId, GuideCopy>
export type GuideArticle = Omit<GuideTopic, "roles"> & GuideCopy
