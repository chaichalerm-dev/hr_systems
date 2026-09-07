import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie"
import { Logo } from "@/components/shared/logo"
import { prisma } from "@/db/client"
import { WorkspaceTools } from "@/components/layout/workspace-tools"
import { getDictionary } from "@/i18n/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [employee, cookieStore] = await Promise.all([
    session.user.employeeId
      ? prisma.employee.findUnique({
          where: { id: session.user.employeeId },
          select: { firstName: true, lastName: true },
        })
      : Promise.resolve(null),
    cookies(),
  ])

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : session.user.email ?? "User"
  const sidebarCollapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "collapsed"
  const t = await getDictionary()

  return (
    // จำกัดโครงหน้าให้สูงเท่าจอ เพื่อให้เมนูและแถบบนอยู่กับที่ขณะเลื่อนเนื้อหา
    // Keep the shell one viewport tall so only the main content scrolls.
    <div className="flex h-dvh overflow-hidden">
      <a href="#main-content" className="sr-only fixed top-2 left-2 z-50 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only">{t.workspace.skipToContent}</a>
      <AppSidebar role={session.user.role} defaultCollapsed={sidebarCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-18 shrink-0 items-center justify-between gap-3 border-b bg-card px-3 sm:px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <MobileNav role={session.user.role} />
            {/* ใช้โลโก้แบบมีไอคอนแทนตัวอักษรเปล่า ให้ตรงกับแบรนด์เหมือนฝั่งเดสก์ท็อป */}
            {/* An icon-mark logo instead of bare text, matching the brand on desktop. */}
            <Logo size="sm" iconOnly className="shrink-0 md:hidden" />
            <div className="mx-1 h-6 w-px shrink-0 bg-border md:hidden" aria-hidden="true" />
            <WorkspaceTools role={session.user.role} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu name={displayName} email={session.user.email ?? ""} role={session.user.role} />
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="workspace-main flex-1 overflow-y-auto p-4 pb-8 outline-none md:p-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
