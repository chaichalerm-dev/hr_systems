"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Role } from "@prisma/client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "@/i18n/client"
import { navGroupsForRole, type NavItem } from "./nav-config"

// Icon components can't cross the server->client boundary as props (they're
// functions), so this resolves the nav list from `role` on the client side
// instead of receiving the already-built NavItem[] from a server parent.
export function SidebarNav({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: Role
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations()
  const groups = navGroupsForRole(role)

  return (
    <nav className={cn("flex flex-col gap-4", collapsed ? "px-2" : "px-3")}>
      {groups.map((group, index) => (
        <div key={group.key} className="flex flex-col gap-1">
          {collapsed ? (
            // Collapsed rail: no room for a heading, but a hairline still
            // marks where one category ends and the next begins.
            index > 0 && <div className="mx-1 mb-1 border-t border-sidebar-border" />
          ) : (
            <p className="px-3 pb-1 text-xs font-medium text-muted-foreground">
              {t.nav[group.key]}
            </p>
          )}
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              label={t.nav[item.labelKey]}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

function NavLink({
  item,
  label,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  label: string
  isActive: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed && label}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
