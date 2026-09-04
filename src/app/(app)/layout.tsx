import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie"
import { APP_NAME } from "@/lib/constants"
import { prisma } from "@/db/client"

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

  return (
    // h-dvh (not min-h-screen) pins this to exactly one viewport tall, so the
    // sidebar and header stay put while only <main> scrolls internally —
    // otherwise a tall page grows the whole flex row past 100vh and the
    // sidebar scrolls away with the rest of the document.
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar role={session.user.role} defaultCollapsed={sidebarCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MobileNav role={session.user.role} />
            <span className="text-sm font-medium md:hidden">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu name={displayName} email={session.user.email ?? ""} role={session.user.role} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
