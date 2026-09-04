import type { Metadata } from "next"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { getAttendanceRules, getPayrollRules } from "@/server/services/company-settings"
import { PageHeader } from "@/components/shared/page-header"
import { AttendanceRulesForm } from "@/features/settings/components/attendance-rules-form"
import { PayrollRulesForm } from "@/features/settings/components/payroll-rules-form"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const [, t, attendanceRules, payrollRules] = await Promise.all([
    requirePageRole([Role.ADMIN]),
    getDictionary(),
    getAttendanceRules(),
    getPayrollRules(),
  ])

  return (
    <>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">{t.settings.attendanceRules}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t.settings.attendanceRulesDescription}</p>
          <div className="mt-4">
            <AttendanceRulesForm initial={attendanceRules} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">{t.settings.payrollRules}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.settings.payrollRulesDescription}
          </p>
          <div className="mt-4">
            <PayrollRulesForm initial={payrollRules} />
          </div>
        </div>
      </div>
    </>
  )
}
