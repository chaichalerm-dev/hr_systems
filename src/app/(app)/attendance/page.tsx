import type { Metadata } from "next"
import { Suspense } from "react"
import type { Dictionary } from "@/i18n/dictionaries/en"
import { PageLoading } from "@/components/shared/page-loading"
import { format } from "date-fns"
import { CalendarCheck, Clock, UserX, CalendarOff } from "lucide-react"
import { Role } from "@prisma/client"

import { requirePageSession } from "@/server/authorization"
import { prisma } from "@/db/client"
import {
  getMonthlySummary,
  getTodayAttendance,
  listAttendanceHistory,
  listTodayTeamAttendance,
} from "@/features/attendance/queries"
import { PageHeader } from "@/components/shared/page-header"
import { StatTile } from "@/features/dashboard/components/stat-tile"
import { CheckInOutWidget } from "@/features/attendance/components/check-in-out-widget"
import { AttendanceTable } from "@/features/attendance/components/attendance-table"
import { TeamTodayCard } from "@/features/attendance/components/team-today-card"
import { getDictionary } from "@/i18n/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = { title: "Attendance" }

async function PersonalAttendance({ employeeId, t }: { employeeId: string; t: Dictionary }) {
  const now = new Date()
  const [today, history, summary] = await Promise.all([
    getTodayAttendance(employeeId),
    listAttendanceHistory(employeeId),
    getMonthlySummary(employeeId, now.getMonth() + 1, now.getFullYear()),
  ])
  return (
    <div className="space-y-6">
      <CheckInOutWidget
        status={today?.status ?? "NOT_CHECKED_IN"}
        checkInTime={today?.checkIn ? format(today.checkIn, "HH:mm") : null}
        checkOutTime={today?.checkOut ? format(today.checkOut, "HH:mm") : null}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t.attendance.presentThisMonth} value={String(summary.present)} icon={CalendarCheck} tone="good" />
        <StatTile label={t.attendance.lateThisMonth} value={String(summary.late)} icon={Clock} tone="warning" />
        <StatTile label={t.attendance.absentThisMonth} value={String(summary.absent)} icon={UserX} tone="critical" />
        <StatTile label={t.attendance.leaveThisMonth} value={String(summary.leave)} icon={CalendarOff} />
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold">{t.attendance.myHistory}</h2>
        <AttendanceTable data={history} />
      </div>
    </div>
  )
}

async function TeamAttendance({ role, employeeId, t }: { role: Role; employeeId: string | null; t: Dictionary }) {
  const members =
    role === Role.MANAGER
      ? await prisma.employee.findMany({
          where: { managerId: employeeId ?? "__none__" },
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
          orderBy: { firstName: "asc" },
        })
      : await prisma.employee.findMany({
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
          orderBy: { firstName: "asc" },
          take: 20,
        })

  const todayRecords = await listTodayTeamAttendance(members.map((m) => m.id))
  const statusByEmployeeId = new Map(todayRecords.map((r) => [r.employeeId, r.status]))

  return (
    <TeamTodayCard
      members={members}
      statusByEmployeeId={statusByEmployeeId}
      title={role === Role.MANAGER ? t.attendance.teamStatusToday : t.attendance.companyStatusToday}
      emptyMessage={t.attendance.noTeamMembers}
    />
  )
}

export default async function AttendancePage() {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const employeeId = session.user.employeeId
  const isManagerOrAbove =
    session.user.role === Role.MANAGER || session.user.role === Role.ADMIN || session.user.role === Role.HR

  return (
    <>
      <PageHeader title={t.attendance.title} description={t.attendance.description} />

      <Tabs defaultValue={employeeId ? "personal" : "team"}>
        {isManagerOrAbove && employeeId && (
          <TabsList>
            <TabsTrigger value="personal">{t.workspace.personal}</TabsTrigger>
            <TabsTrigger value="team">{t.workspace.team}</TabsTrigger>
          </TabsList>
        )}
        {employeeId && (
          <TabsContent value="personal" className="space-y-6">
            <Suspense fallback={<PageLoading />}>
              <PersonalAttendance employeeId={employeeId} t={t} />
            </Suspense>
          </TabsContent>
        )}
        {isManagerOrAbove && (
          <TabsContent value="team">
            <Suspense fallback={<PageLoading />}>
              <TeamAttendance role={session.user.role} employeeId={employeeId} t={t} />
            </Suspense>
          </TabsContent>
        )}
        {!employeeId && !isManagerOrAbove && <p className="text-sm text-muted-foreground">{t.attendance.noEmployeeProfile}</p>}
      </Tabs>
    </>
  )
}
