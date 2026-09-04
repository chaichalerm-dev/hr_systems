import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { Mail, Phone, MapPin, Building2, UserCog, Calendar, Pencil, Wallet, ShieldAlert } from "lucide-react"
import { Role } from "@prisma/client"

import { requirePageSession, canViewEmployeeRecord, canViewEmployeePayroll } from "@/server/authorization"
import { getEmployeeById } from "@/features/employees/queries"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LinkButton } from "@/components/shared/link-button"
import { formatCurrency } from "@/lib/format"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Employee Profile" }

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  )
}

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const { id } = await params

  const employee = await getEmployeeById(id)
  if (!employee) notFound()

  if (!canViewEmployeeRecord(session, { id: employee.id, managerId: employee.managerId })) {
    redirect("/unauthorized")
  }

  const canManage = session.user.role === Role.ADMIN || session.user.role === Role.HR
  const canSeePayroll = canViewEmployeePayroll(session, employee.id)
  const canSeeStatutory = canManage || session.user.employeeId === employee.id

  return (
    <>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        breadcrumbs={[{ label: t.employees.title, href: "/employees" }, { label: `${employee.firstName} ${employee.lastName}` }]}
        actions={
          canManage ? (
            <LinkButton variant="outline" href={`/employees/${employee.id}/edit`}>
              <Pencil className="size-4" />
              {t.employees.editEmployee}
            </LinkButton>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <Avatar className="mx-auto size-20">
              <AvatarImage src={employee.profileImageUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {initials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{employee.position.title}</p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={employee.employmentStatus} />
            </div>
            <div className="mt-5 space-y-2 border-t pt-4 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span>{employee.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4 shrink-0" />
                <span>{employee.department.name}</span>
              </div>
              {employee.manager && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserCog className="size-4 shrink-0" />
                  <span>
                    {t.employees.reportsTo.replace("{name}", `${employee.manager.firstName} ${employee.manager.lastName}`)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>{t.employees.joined.replace("{date}", format(employee.startDate, "d MMM yyyy"))}</span>
              </div>
            </div>
          </div>

          {canSeePayroll ? (
            <LinkButton variant="outline" className="w-full" href="/payslips">
              <Wallet className="size-4" />
              {t.employees.viewPayslips}
            </LinkButton>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0" />
              {t.employees.payrollRestricted}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold">{t.employees.employmentDetails}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t.employees.employeeCode} value={employee.employeeCode} />
              <Field label={t.employees.employmentType} value={t.employmentType[employee.employmentType]} />
              <Field label={t.employees.department} value={employee.department.name} />
              <Field label={t.employees.position} value={employee.position.title} />
              <Field label={t.employees.startDate} value={format(employee.startDate, "d MMM yyyy")} />
              <Field label={t.employees.endDate} value={employee.endDate ? format(employee.endDate, "d MMM yyyy") : null} />
              {canSeePayroll && <Field label={t.employees.monthlySalary} value={formatCurrency(employee.salary.toString())} />}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold">{t.employees.addressSection}</h3>
            <div className="mt-4 flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">
                {[employee.addressLine1, employee.addressLine2, employee.city, employee.province, employee.postalCode, employee.country]
                  .filter(Boolean)
                  .join(", ") || t.employees.noAddress}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold">{t.employees.emergencyContact}</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label={t.employees.name} value={employee.emergencyContactName} />
              <Field label={t.employees.phone} value={employee.emergencyContactPhone} />
              <Field label={t.employees.relationship} value={employee.emergencyContactRelation} />
            </div>
          </div>

          {canSeeStatutory && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-semibold">{t.employees.bankingStatutory}</h3>
              <p className="text-xs text-muted-foreground">{t.employees.demoPlaceholderNote}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={t.employees.bank} value={employee.bankName} />
                <Field label={t.employees.accountNumber} value={employee.bankAccountNumber} />
                <Field label={t.employees.taxId} value={employee.taxId} />
                <Field label={t.employees.socialSecurityNo} value={employee.socialSecurityNo} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
