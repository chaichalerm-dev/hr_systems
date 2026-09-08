import type { Metadata } from "next"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { getAttendanceRules, getPayrollRules } from "@/server/services/company-settings"
import { PageHeader } from "@/components/shared/page-header"
import { AttendanceRulesForm } from "@/features/settings/components/attendance-rules-form"
import { PayrollRulesForm } from "@/features/settings/components/payroll-rules-form"
import { getDictionary } from "@/i18n/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">{t.settings.attendanceRules}</TabsTrigger>
          <TabsTrigger value="payroll">{t.settings.payrollRules}</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-4 max-w-3xl">
          <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">{t.settings.attendanceRules}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.settings.attendanceRulesDescription}</p>
            <div className="mt-6">
              <AttendanceRulesForm initial={attendanceRules} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="payroll" className="mt-4 max-w-3xl">
          <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold">{t.settings.payrollRules}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.settings.payrollRulesDescription}</p>
            <div className="mt-6">
              <PayrollRulesForm initial={payrollRules} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
