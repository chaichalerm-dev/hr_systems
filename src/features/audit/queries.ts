import "server-only"

import { prisma } from "@/db/client"

export interface AuditLogItem {
  id: string
  actorName: string
  action: string
  entity: string
  entityId: string
  metadata: unknown
  createdAt: Date
}

export async function listAuditLogs(page: number, pageSize: number) {
  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: { select: { email: true, employee: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count(),
  ])

  const items: AuditLogItem[] = rows.map((r) => ({
    id: r.id,
    actorName: r.actor ? (r.actor.employee ? `${r.actor.employee.firstName} ${r.actor.employee.lastName}` : r.actor.email) : "System",
    action: r.action,
    entity: r.entity,
    entityId: r.entityId,
    metadata: r.metadata,
    createdAt: r.createdAt,
  }))

  return { items, total, page, pageSize }
}
