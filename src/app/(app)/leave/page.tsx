import type { Metadata } from "next"
import { Role } from "@prisma/client"

import { requirePageSession } from "@/server/authorization"
import { listLeaveBalances, listLeaveTypes, listMyLeaveRequests, listPendingApprovals } from "@/features/leave/queries"
import { PageHeader } from "@/components/shared/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaveBalanceCards } from "@/features/leave/components/leave-balance-cards"
import { LeaveRequestList } from "@/features/leave/components/leave-request-list"
import { NewLeaveRequestDialog } from "@/features/leave/components/new-leave-request-dialog"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = { title: "Leave" }

export default async function LeavePage() {
  const [session, t] = await Promise.all([requirePageSession(), getDictionary()])
  const currentYear = new Date().getFullYear()
  const canApprove = session.user.role === Role.MANAGER || session.user.role === Role.HR || session.user.role === Role.ADMIN

  const [leaveTypes, myRequests, balances, pendingApprovals] = await Promise.all([
    listLeaveTypes(),
    session.user.employeeId ? listMyLeaveRequests(session.user.employeeId) : Promise.resolve([]),
    session.user.employeeId ? listLeaveBalances(session.user.employeeId, currentYear) : Promise.resolve([]),
    canApprove ? listPendingApprovals(session) : Promise.resolve([]),
  ])

  const myRequestRows = myRequests.map((r) => ({
    ...r,
    canDecide: false,
    canCancel: r.status === "PENDING_MANAGER" || r.status === "PENDING_HR",
  }))
  const pendingApprovalRows = pendingApprovals.map((r) => ({ ...r, canDecide: true, canCancel: false }))

  const myRequestsView = (
    <div className="space-y-6">
      <LeaveBalanceCards balances={balances} />
      <LeaveRequestList requests={myRequestRows} emptyMessage={t.leave.noRequests} />
    </div>
  )

  const approvalsView = (
    <LeaveRequestList requests={pendingApprovalRows} showEmployee emptyMessage={t.leave.nothingPending} />
  )

  return (
    <>
      <PageHeader
        title={t.leave.title}
        description={t.leave.description}
        actions={session.user.employeeId ? <NewLeaveRequestDialog leaveTypes={leaveTypes} /> : undefined}
      />

      {canApprove ? (
        <Tabs defaultValue="approvals">
          <TabsList>
            <TabsTrigger value="approvals">
              {t.leave.approvals}{pendingApprovals.length > 0 ? ` (${pendingApprovals.length})` : ""}
            </TabsTrigger>
            <TabsTrigger value="mine">{t.leave.myRequests}</TabsTrigger>
          </TabsList>
          <TabsContent value="approvals" className="mt-4">
            {approvalsView}
          </TabsContent>
          <TabsContent value="mine" className="mt-4">
            {myRequestsView}
          </TabsContent>
        </Tabs>
      ) : (
        myRequestsView
      )}
    </>
  )
}
