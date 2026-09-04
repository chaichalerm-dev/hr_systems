import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { requirePageSession, canViewEmployeePayroll } from "@/server/authorization"
import { getTaxDocumentData } from "@/features/payroll/queries"
import { PageHeader } from "@/components/shared/page-header"
import { PrintButton } from "@/components/shared/print-button"
import { TaxDocument } from "@/features/payroll/components/tax-document"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Tax Document" }

export default async function TaxDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>
  searchParams: Promise<{ year?: string }>
}) {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const { employeeId } = await params
  const { year: yearParam } = await searchParams

  if (!canViewEmployeePayroll(session, employeeId)) redirect("/unauthorized")

  const taxYear = yearParam ? Number(yearParam) : new Date().getFullYear()
  const data = await getTaxDocumentData(employeeId, taxYear)
  if (!data) notFound()

  return (
    <>
      <div className="no-print">
        <PageHeader
          title={t.tax.title}
          description={`${data.employeeName} — ${t.tax.taxYear.replace("{year}", String(taxYear))}`}
          actions={<PrintButton />}
        />
      </div>
      <TaxDocument data={{ ...data, taxYear }} t={t} />
    </>
  )
}
