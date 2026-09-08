import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { Download, Eye } from "lucide-react"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { getPayrollRunDetail } from "@/features/payroll/queries"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { PayrollWorkflowActions } from "@/features/payroll/components/payroll-workflow-actions"
import { AddAdjustmentDialog } from "@/features/payroll/components/add-adjustment-dialog"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Payroll Run" }

export default async function PayrollRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const [, t] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary()])
  const { runId } = await params

  const run = await getPayrollRunDetail(runId)
  if (!run) notFound()

  const totals = run.items.reduce(
    (acc, item) => ({
      gross: acc.gross + item.grossIncome,
      deductions: acc.deductions + item.totalDeductions,
      net: acc.net + item.netSalary,
    }),
    { gross: 0, deductions: 0, net: 0 }
  )

  return (
    <>
      <PageHeader
        title={format(new Date(run.year, run.month - 1, 1), "MMMM yyyy")}
        breadcrumbs={[{ label: t.payroll.title, href: "/payroll" }, { label: format(new Date(run.year, run.month - 1, 1), "MMMM yyyy") }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" nativeButton={false} render={<Link href={`/api/payroll/${run.id}/export`} />}>
              <Download className="size-4" />
              {t.common.export}
            </Button>
            <PayrollWorkflowActions runId={run.id} status={run.status} />
          </div>
        }
      />

      <div className="space-y-6">
        {/* จัดเป็นกริด 2 คอลัมน์บนมือถือแทน flex-wrap เดิม ที่ห่อบรรทัดแบบไม่แน่นอนตามความยาวข้อความ */}
        {/* A 2-column grid on mobile instead of the old flex-wrap, which wrapped unpredictably based on text length. */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 shadow-sm sm:flex sm:flex-wrap sm:items-center sm:gap-6">
          <div>
            <p className="text-xs text-muted-foreground">{t.common.status}</p>
            <div className="mt-1">
              <StatusBadge status={run.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.payroll.createdBy}</p>
            <p className="text-sm font-medium">{run.createdByName}</p>
          </div>
          {run.approvedByName && (
            <div>
              <p className="text-xs text-muted-foreground">{t.payroll.approvedBy}</p>
              <p className="text-sm font-medium">{run.approvedByName}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">{t.payroll.gross}</p>
            <p className="text-sm font-medium tabular-nums">{formatCurrency(totals.gross)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.payroll.deductions}</p>
            <p className="text-sm font-medium tabular-nums">{formatCurrency(totals.deductions)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t.payroll.netPayout}</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(totals.net)}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.employees.employee}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.gross}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.deductions}</th>
                <th className="px-4 py-3 font-medium">{t.payroll.net}</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {run.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.employeeCode} · {item.department}
                      {item.adjustmentCount > 0 ? ` · ${t.payroll.adjustmentCount.replace("{count}", String(item.adjustmentCount))}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(item.grossIncome)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(item.totalDeductions)}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{formatCurrency(item.netSalary)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <AddAdjustmentDialog payrollItemId={item.id} employeeName={item.employeeName} />
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={`/payroll/${run.id}/payslip/${item.id}`} />}
                      >
                        <Eye className="size-3.5" />
                        {t.payslip.title}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
