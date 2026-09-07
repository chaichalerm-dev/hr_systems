import type { Metadata } from "next"
import Link from "next/link"
import { ReceiptText, FileText } from "lucide-react"

import { requirePageSession } from "@/server/authorization"
import { listEmployeePayslips } from "@/features/payroll/queries"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { LinkButton } from "@/components/shared/link-button"
import { formatCurrency } from "@/lib/format"
import { prisma } from "@/db/client"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "My Payslips" }

export default async function MyPayslipsPage() {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const payslips = session.user.employeeId ? await listEmployeePayslips(session.user.employeeId) : []

  const runIdByItemId = new Map<string, string>()
  if (payslips.length > 0) {
    const items = await prisma.payrollItem.findMany({
      where: { id: { in: payslips.map((p) => p.payrollItemId) } },
      select: { id: true, payrollRunId: true },
    })
    for (const item of items) runIdByItemId.set(item.id, item.payrollRunId)
  }

  return (
    <>
      <PageHeader
        title={t.payslip.myPayslips}
        description={t.payslip.myPayslipsDescription}
        actions={
          session.user.employeeId ? (
            <LinkButton variant="outline" href={`/payroll/tax/${session.user.employeeId}`}>
              <FileText className="size-4" />
              {t.tax.annualTaxDocument}
            </LinkButton>
          ) : undefined
        }
      />
      {payslips.length === 0 ? (
        <EmptyState icon={ReceiptText} title={t.payslip.noPayslips} description={t.payslip.noPayslipsDescription} />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.payslip.period}</th>
                <th className="px-4 py-3 font-medium">{t.payslip.netSalary}</th>
                <th className="px-4 py-3 font-medium">{t.payslip.issued}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {payslips.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.period}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(p.netSalary)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.issuedAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {/* inline-block + min-width keeps this a usable tap target even for
                        short labels like Thai "ดู", which is only a few pixels wide. */}
                    <Link
                      href={`/payroll/${runIdByItemId.get(p.payrollItemId)}/payslip/${p.payrollItemId}`}
                      className="inline-block min-w-16 rounded-md px-2 py-1 text-center font-medium text-primary hover:bg-accent hover:underline"
                    >
                      {t.common.view}
                    </Link>
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
