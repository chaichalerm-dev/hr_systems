import { Workflow } from "lucide-react"

import { COMPANY_INFO } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { Dictionary } from "@/i18n/dictionaries/en"
import type { PayslipDetail, PayslipLine } from "../queries"

function lineLabel(line: PayslipLine, t: Dictionary): string {
  return line.labelKey ? t.payslip[line.labelKey] : line.label
}

export function PayslipDocument({ payslip, t }: { payslip: PayslipDetail; t: Dictionary }) {
  return (
    <div className="print-area mx-auto max-w-2xl rounded-xl border bg-card p-8 shadow-sm print:rounded-none print:border-none print:shadow-none">
      <div className="flex items-start justify-between border-b pb-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          <div>
            <p className="font-semibold">{COMPANY_INFO.name}</p>
            <p className="text-xs text-muted-foreground">{COMPANY_INFO.address}</p>
            <p className="text-xs text-muted-foreground">Tax ID: {COMPANY_INFO.taxId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{t.payslip.title}</p>
          <p className="text-sm text-muted-foreground">{payslip.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-b py-6 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{t.payslip.employee}</p>
          <p className="font-medium">{payslip.employeeName}</p>
          <p className="text-muted-foreground">{payslip.employeeCode}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.payslip.departmentPosition}</p>
          <p className="font-medium">{payslip.department}</p>
          <p className="text-muted-foreground">{payslip.position}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.payslip.bank}</p>
          <p className="font-medium">{payslip.bankName ?? "—"}</p>
          <p className="text-muted-foreground">{payslip.bankAccountNumber ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t.payslip.payPeriod}</p>
          <p className="font-medium">{payslip.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 py-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.payslip.income}</h3>
          <table className="w-full text-sm">
            <tbody>
              {payslip.income.map((row) => (
                <tr key={row.label} className="border-b border-dashed last:border-0">
                  <td className="py-1.5 text-muted-foreground">{lineLabel(row, t)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatCurrency(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.payslip.deductions}</h3>
          <table className="w-full text-sm">
            <tbody>
              {payslip.deductions.length > 0 ? (
                payslip.deductions.map((row) => (
                  <tr key={row.label} className="border-b border-dashed last:border-0">
                    <td className="py-1.5 text-muted-foreground">{lineLabel(row, t)}</td>
                    <td className="py-1.5 text-right tabular-nums">{formatCurrency(row.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-1.5 text-muted-foreground">{t.payslip.noDeductions}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2 border-t pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.payslip.grossIncome}</span>
          <span className="tabular-nums">{formatCurrency(payslip.grossIncome)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.payslip.totalDeductions}</span>
          <span className="tabular-nums">{formatCurrency(payslip.totalDeductions)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>{t.payslip.netSalary}</span>
          <span className="tabular-nums">{formatCurrency(payslip.netSalary)}</span>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        {t.payslip.footer}
      </p>
    </div>
  )
}
