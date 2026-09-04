import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Users } from "lucide-react"

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export function TeamTodayCard({
  members,
  statusByEmployeeId,
  title,
  emptyMessage,
}: {
  members: TeamMember[]
  statusByEmployeeId: Map<string, string>
  title: string
  emptyMessage: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">{title}</h2>
      {members.length === 0 ? (
        <EmptyState icon={Users} title={emptyMessage} />
      ) : (
        <ul className="mt-3 divide-y">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(m.firstName, m.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.employeeCode}</p>
                </div>
              </div>
              <StatusBadge status={statusByEmployeeId.get(m.id) ?? "ABSENT"} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
