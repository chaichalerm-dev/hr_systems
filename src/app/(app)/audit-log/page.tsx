import type { Metadata } from "next"
import { format } from "date-fns"
import { Role } from "@prisma/client"

import { requirePageRole } from "@/server/authorization"
import { listAuditLogs } from "@/features/audit/queries"
import { PageHeader } from "@/components/shared/page-header"
import { PaginationControls } from "@/components/shared/pagination-controls"
import { EmptyState } from "@/components/shared/empty-state"
import { ShieldCheck } from "lucide-react"
import { getDictionary } from "@/i18n/server"
import type { Dictionary } from "@/i18n/dictionaries/en"

export const metadata: Metadata = { title: "Audit Log" }

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [, t] = await Promise.all([requirePageRole([Role.ADMIN, Role.HR]), getDictionary()])
  const params = await searchParams
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1
  const pageSize = 20

  const { items, total } = await listAuditLogs(page, pageSize)

  return (
    <>
      <PageHeader title={t.auditLog.title} description={t.auditLog.description} />
      {items.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t.auditLog.noEntries} />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{t.auditLog.when}</th>
                  <th className="px-4 py-3 font-medium">{t.auditLog.actor}</th>
                  <th className="px-4 py-3 font-medium">{t.auditLog.action}</th>
                  <th className="px-4 py-3 font-medium">{t.auditLog.entity}</th>
                  <th className="px-4 py-3 font-medium">{t.auditLog.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {format(entry.createdAt, "d MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-4 py-3 font-medium">{entry.actorName}</td>
                    <td className="px-4 py-3">{t.auditLog.actions[entry.action as keyof Dictionary["auditLog"]["actions"]] ?? entry.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.entity}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {entry.metadata && Object.keys(entry.metadata as object).length > 0
                        ? <details><summary className="cursor-pointer whitespace-nowrap py-2 font-medium text-primary">{t.common.view}</summary><pre className="mt-2 max-w-xs overflow-x-auto rounded-lg bg-muted p-3 font-mono">{JSON.stringify(entry.metadata, null, 2)}</pre></details>
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls page={page} pageSize={pageSize} total={total} />
        </div>
      )}
    </>
  )
}
