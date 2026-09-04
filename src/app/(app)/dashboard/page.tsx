import type { Metadata } from "next"
import { Users, UserCheck, Clock, CalendarOff, Inbox, Banknote, LogIn, LogOut as LogOutIcon } from "lucide-react"
import { Role } from "@prisma/client"

import { requirePageSession } from "@/server/authorization"
import {
  getEmployeeDashboardData,
  getManagerDashboardMetrics,
  getOrgDashboardMetrics,
} from "@/server/services/dashboard"
import { PageHeader } from "@/components/shared/page-header"
import { StatTile } from "@/features/dashboard/components/stat-tile"
import { AttendanceTrendChart } from "@/features/dashboard/components/attendance-trend-chart"
import { SimpleBarChart } from "@/features/dashboard/components/simple-bar-chart"
import { formatCurrency, formatNumber } from "@/lib/format"
import { getDictionary } from "@/i18n/server"
import type { Dictionary } from "@/i18n/dictionaries/en"

export const metadata: Metadata = { title: "Dashboard" }

async function OrgDashboard({ t }: { t: Dictionary }) {
  const metrics = await getOrgDashboardMetrics()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label={t.dashboard.totalEmployees}
          value={formatNumber(metrics.totalEmployees)}
          icon={Users}
          hint={t.dashboard.activeCount.replace("{count}", String(metrics.activeEmployees))}
        />
        <StatTile label={t.dashboard.presentToday} value={formatNumber(metrics.presentToday)} icon={UserCheck} tone="good" />
        <StatTile label={t.dashboard.lateToday} value={formatNumber(metrics.lateToday)} icon={Clock} tone="warning" />
        <StatTile label={t.dashboard.onLeaveToday} value={formatNumber(metrics.onLeaveToday)} icon={CalendarOff} tone="critical" />
        <StatTile
          label={t.dashboard.pendingLeaveApprovals}
          value={formatNumber(metrics.pendingLeaveApprovals)}
          icon={Inbox}
          tone="warning"
        />
        <StatTile label={t.dashboard.monthlyPayrollCost} value={formatCurrency(metrics.monthlyPayrollCost)} icon={Banknote} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.attendanceTrend}</h2>
          <p className="text-xs text-muted-foreground">{t.dashboard.attendanceTrendDescription}</p>
          <div className="mt-4">
            <AttendanceTrendChart data={metrics.attendanceTrend} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.headcountByDepartment}</h2>
          <p className="text-xs text-muted-foreground">{t.dashboard.headcountDescription}</p>
          <div className="mt-4">
            <SimpleBarChart
              data={metrics.departmentHeadcount.map((d) => ({ category: d.department, value: d.count }))}
              valueLabel={t.dashboard.employees}
            />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.leaveByType}</h2>
          <p className="text-xs text-muted-foreground">{t.dashboard.leaveByTypeDescription}</p>
          <div className="mt-4">
            {metrics.leaveStats.length > 0 ? (
              <SimpleBarChart
                data={metrics.leaveStats.map((s) => ({ category: s.leaveType, value: s.days }))}
                valueLabel={t.common.days}
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">{t.dashboard.noApprovedLeave}</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.payrollTrend}</h2>
          <p className="text-xs text-muted-foreground">{t.dashboard.payrollTrendDescription}</p>
          <div className="mt-4">
            {metrics.payrollTrend.length > 0 ? (
              <SimpleBarChart
                data={metrics.payrollTrend.map((p) => ({ category: p.period, value: p.totalNet }))}
                valueLabel={t.dashboard.netPayout}
                format="currency"
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">{t.dashboard.noPayrollRuns}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

async function ManagerDashboard({ employeeId, t }: { employeeId: string; t: Dictionary }) {
  const metrics = await getManagerDashboardMetrics(employeeId)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t.dashboard.teamSize} value={formatNumber(metrics.teamSize)} icon={Users} />
        <StatTile label={t.dashboard.presentToday} value={formatNumber(metrics.presentToday)} icon={UserCheck} tone="good" />
        <StatTile label={t.dashboard.lateToday} value={formatNumber(metrics.lateToday)} icon={Clock} tone="warning" />
        <StatTile
          label={t.dashboard.pendingApprovals}
          value={formatNumber(metrics.pendingApprovals)}
          icon={Inbox}
          tone="warning"
        />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold">{t.dashboard.teamAttendanceTrend}</h2>
        <div className="mt-4">
          <AttendanceTrendChart data={metrics.attendanceTrend} />
        </div>
      </div>
    </div>
  )
}

async function EmployeeDashboard({ employeeId, t }: { employeeId: string; t: Dictionary }) {
  const data = await getEmployeeDashboardData(employeeId)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">{t.dashboard.today}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <LogIn className="size-4 text-status-good" />
            <span className="text-muted-foreground">{t.dashboard.checkInLabel}</span>
            <span className="font-medium">{data.checkInTime ?? ","}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <LogOutIcon className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.dashboard.checkOutLabel}</span>
            <span className="font-medium">{data.checkOutTime ?? ","}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.leaveBalances}</h2>
          <ul className="mt-3 space-y-2">
            {data.leaveBalances.map((b) => (
              <li key={b.leaveType} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{b.leaveType}</span>
                <span className="font-medium tabular-nums">
                  {b.remaining} / {b.total} {t.common.days}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold">{t.dashboard.latestPayslip}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {data.recentPayslipPeriod
              ? `${t.dashboard.period}: ${data.recentPayslipPeriod}`
              : t.dashboard.noPayslips}
          </p>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])

  return (
    <>
      <PageHeader title={t.dashboard.title} description={t.dashboard.description} />
      {session.user.role === Role.ADMIN || session.user.role === Role.HR ? (
        <OrgDashboard t={t} />
      ) : session.user.role === Role.MANAGER && session.user.employeeId ? (
        <ManagerDashboard employeeId={session.user.employeeId} t={t} />
      ) : session.user.employeeId ? (
        <EmployeeDashboard employeeId={session.user.employeeId} t={t} />
      ) : (
        <p className="text-sm text-muted-foreground">{t.dashboard.noEmployeeProfile}</p>
      )}
    </>
  )
}
