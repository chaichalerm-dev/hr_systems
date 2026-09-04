import type { LeaveBalanceItem } from "../queries"

export function LeaveBalanceCards({ balances }: { balances: LeaveBalanceItem[] }) {
  if (balances.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {balances.map((b) => (
        <div key={b.leaveTypeId} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">{b.leaveType}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {b.remainingDays}
            <span className="text-sm font-normal text-muted-foreground"> / {b.totalDays} days</span>
          </p>
        </div>
      ))}
    </div>
  )
}
