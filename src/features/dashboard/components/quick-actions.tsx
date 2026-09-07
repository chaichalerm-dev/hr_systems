import Link from "next/link"
import { ArrowUpRight, CalendarCheck, CalendarDays, Users, ReceiptText, Banknote } from "lucide-react"
import { Role } from "@prisma/client"
import type { Dictionary } from "@/i18n/dictionaries/en"

export function QuickActions({ role, t }: { role: Role; t: Dictionary }) {
  const manage = role === Role.ADMIN || role === Role.HR
  const actions = [
    { href: "/attendance", label: t.attendance.title, hint: t.workspace.attendanceHint, icon: CalendarCheck },
    { href: "/leave", label: role === Role.EMPLOYEE ? t.leave.requestLeave : t.leave.approvals, hint: t.workspace.leaveHint, icon: CalendarDays },
    ...(role !== Role.EMPLOYEE ? [{ href: "/employees", label: t.employees.title, hint: t.workspace.employeesHint, icon: Users }] : []),
    ...(manage ? [{ href: "/payroll", label: t.payroll.title, hint: t.workspace.payrollHint, icon: Banknote }] : role === Role.EMPLOYEE ? [{ href: "/payslips", label: t.payslip.myPayslips, hint: t.workspace.payslipsHint, icon: ReceiptText }] : []),
  ]
  return (
    <section aria-labelledby="quick-actions-title" className="rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="quick-actions-title" className="font-semibold">{t.workspace.quickActions}</h2>
        <p className="text-sm text-muted-foreground">{t.workspace.quickActionsHint}</p>
      </div>
      <div className={`grid gap-3 sm:grid-cols-2 ${actions.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
        {actions.map(({ href, label, hint, icon: Icon }) => (
          <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{hint}</span></span>
            <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  )
}
