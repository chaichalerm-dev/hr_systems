import type { Metadata } from "next"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { PageHeader } from "@/components/shared/page-header"
import { DateRangeReportCard } from "@/features/reports/components/date-range-report-card"
import { SimpleReportCard } from "@/features/reports/components/simple-report-card"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Reports" }

export default async function ReportsPage() {
  const [, t] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary()])

  return (
    <>
      <PageHeader title={t.reports.title} description={t.reports.description} />
      <div className="grid gap-4 sm:grid-cols-2">
        <DateRangeReportCard
          title={t.reports.attendanceReport}
          description={t.reports.attendanceReportDescription}
          endpoint="/api/reports/attendance"
        />
        <DateRangeReportCard
          title={t.reports.leaveReport}
          description={t.reports.leaveReportDescription}
          endpoint="/api/reports/leave"
        />
        <SimpleReportCard
          title={t.reports.employeeReport}
          description={t.reports.employeeReportDescription}
          endpoint="/api/reports/employees"
        />
        <SimpleReportCard
          title={t.reports.payrollReport}
          description={t.reports.payrollReportDescription}
          endpoint="/api/reports/payroll"
        />
      </div>
    </>
  )
}
