"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import type { Role } from "@prisma/client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Logo } from "@/components/shared/logo"
import { useTranslations } from "@/i18n/client"
import { SIDEBAR_COOKIE } from "./sidebar-cookie"
import { SidebarNav } from "./sidebar-nav"

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export function AppSidebar({ role, defaultCollapsed }: { role: Role; defaultCollapsed: boolean }) {
  const t = useTranslations()
  // Seeded from a cookie the server already read, so the first paint matches
  // the stored preference — no flash of the wrong width, no hydration warning.
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
  }

  const toggleLabel = collapsed ? t.nav.expandSidebar : t.nav.collapseSidebar

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b", collapsed ? "justify-center px-2" : "px-5")}>
        <Logo iconOnly={collapsed} />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <SidebarNav role={role} collapsed={collapsed} />
      </div>

      <div className={cn("border-t", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon" className="w-full" aria-label={toggleLabel} onClick={toggle} />}
            >
              <PanelLeftOpen className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right">{toggleLabel}</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggle}>
            <PanelLeftClose className="size-4" />
            {toggleLabel}
          </Button>
        )}
      </div>
    </aside>
  )
}
