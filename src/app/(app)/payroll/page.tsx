import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { listPayrollRuns } from "@/features/payroll/queries"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatCurrency } from "@/lib/format"
import { GeneratePayrollDialog } from "@/features/payroll/components/generate-payroll-dialog"
import { Banknote } from "lucide-react"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Payroll" }

export default async function PayrollPage() {
  const [, t, runs] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary(), listPayrollRuns()])

  return (
    <>
      <PageHeader title={t.payroll.title} description={t.payroll.description} actions={<GeneratePayrollDialog />} />
      {runs.length === 0 ? (
        <EmptyState icon={Banknote} title={t.payroll.noRuns} description={t.payroll.noRunsDescription} />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.payroll.periodColumn}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.employeesColumn}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.totalNet}</th>
                <th className="px-4 py-3 font-medium">{t.common.status}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.paidColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/payroll/${run.id}`} className="hover:underline">
                      {format(new Date(run.year, run.month - 1, 1), "MMMM yyyy")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{run.employeeCount}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(run.totalNet)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {run.paidAt ? format(run.paidAt, "d MMM yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
