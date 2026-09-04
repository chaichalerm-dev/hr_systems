import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { requirePageSession, canViewEmployeePayroll } from "@/server/authorization"
import { getPayslipDetail } from "@/features/payroll/queries"
import { PageHeader } from "@/components/shared/page-header"
import { PrintButton } from "@/components/shared/print-button"
import { PayslipDocument } from "@/features/payroll/components/payslip-document"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Payslip" }

export default async function PayslipPage({ params }: { params: Promise<{ runId: string; itemId: string }> }) {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const { itemId } = await params

  const payslip = await getPayslipDetail(itemId)
  if (!payslip) notFound()
  if (!canViewEmployeePayroll(session, payslip.employeeId)) redirect("/unauthorized")

  return (
    <>
      <div className="no-print">
        <PageHeader
          title={t.payslip.title}
          description={`${payslip.employeeName}, ${payslip.period}`}
          actions={<PrintButton />}
        />
      </div>
      <PayslipDocument payslip={payslip} t={t} />
    </>
  )
}
