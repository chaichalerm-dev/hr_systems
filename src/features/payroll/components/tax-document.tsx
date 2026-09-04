import { AlertTriangle, Workflow } from "lucide-react"

import { COMPANY_INFO } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { Dictionary } from "@/i18n/dictionaries/en"

export interface TaxDocumentData {
  employeeName: string
  employeeCode: string
  taxId: string | null
  socialSecurityNo: string | null
  taxYear: number
  totalGrossIncome: number
  totalWithholdingTax: number
  totalSocialSecurity: number
  monthsIncluded: number
}

export function TaxDocument({ data, t }: { data: TaxDocumentData; t: Dictionary }) {
  return (
    <div className="print-area mx-auto max-w-2xl rounded-xl border bg-card p-8 shadow-sm print:rounded-none print:border-none print:shadow-none">
      <div className="no-print mb-6 flex items-start gap-2 rounded-lg border border-status-warning/30 bg-status-warning/10 p-3 text-xs text-amber-800 dark:text-status-warning">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>{t.tax.disclaimer}</p>
      </div>

      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          <div>
            <p className="font-semibold">{COMPANY_INFO.name}</p>
            <p className="text-xs text-muted-foreground">{COMPANY_INFO.address}</p>
            <p className="text-xs text-muted-foreground">{t.tax.employerTaxId.replace("{id}", COMPANY_INFO.taxId)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{t.tax.documentTitle}</p>
          <p className="text-sm text-muted-foreground">{t.tax.taxYear.replace("{year}", String(data.taxYear))}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-b py-6 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{t.payslip.employee}</p>
          <p className="font-medium">{data.employeeName}</p>
          <p className="text-muted-foreground">{data.employeeCode}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.tax.taxId}</p>
          <p className="font-medium">{data.taxId ?? ","}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.tax.socialSecurityNo}</p>
          <p className="font-medium">{data.socialSecurityNo ?? ","}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.tax.monthsIncluded}</p>
          <p className="font-medium">{t.tax.monthsOf.replace("{count}", String(data.monthsIncluded))}</p>
        </div>
      </div>

      <div className="space-y-2 py-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.tax.totalGrossIncome}</span>
          <span className="tabular-nums">{formatCurrency(data.totalGrossIncome)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.tax.totalSocialSecurity}</span>
          <span className="tabular-nums">{formatCurrency(data.totalSocialSecurity)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>{t.tax.totalWithholdingTax}</span>
          <span className="tabular-nums">{formatCurrency(data.totalWithholdingTax)}</span>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        {t.tax.footer.replace("{year}", String(data.taxYear))}
      </p>
    </div>
  )
}
