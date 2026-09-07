import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowDown, ArrowRight, ArrowUpRight, Banknote, BriefcaseBusiness,
  CalendarCheck, CalendarDays, Check, FileBarChart, FileText,
  LayoutDashboard, ShieldCheck, UserRound, Users,
} from "lucide-react"

import { BrandMark, Logo } from "@/components/shared/logo"
import { LinkButton } from "@/components/shared/link-button"
import { BackToTopButton } from "@/components/shared/back-to-top-button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { APP_NAME } from "@/lib/constants"
import { getDictionary } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return { title: `${APP_NAME} | HR Management`, description: t.app.tagline }
}

export default async function LandingPage() {
  const t = await getDictionary()
  const features = [
    { icon: Users, title: t.landing.features.employees, description: t.landing.features.employeesDescription, color: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
    { icon: CalendarCheck, title: t.landing.features.attendance, description: t.landing.features.attendanceDescription, color: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
    { icon: CalendarDays, title: t.landing.features.leave, description: t.landing.features.leaveDescription, color: "bg-violet-500/10 text-violet-600 dark:text-violet-300" },
    { icon: Banknote, title: t.landing.features.payroll, description: t.landing.features.payrollDescription, color: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
    { icon: LayoutDashboard, title: t.landing.features.dashboard, description: t.landing.features.dashboardDescription, color: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
    { icon: FileBarChart, title: t.landing.features.reports, description: t.landing.features.reportsDescription, color: "bg-rose-500/10 text-rose-600 dark:text-rose-300" },
  ]
  const accounts = [
    { icon: ShieldCheck, role: t.roles.ADMIN, description: t.landing.accounts.adminDescription },
    { icon: BriefcaseBusiness, role: t.roles.HR, description: t.landing.accounts.hrDescription },
    { icon: Users, role: t.roles.MANAGER, description: t.landing.accounts.managerDescription },
    { icon: UserRound, role: t.roles.EMPLOYEE, description: t.landing.accounts.employeeDescription },
  ]
  const steps = [
    { title: t.landing.stepOne, description: t.landing.stepOneDescription },
    { title: t.landing.stepTwo, description: t.landing.stepTwoDescription },
    { title: t.landing.stepThree, description: t.landing.stepThreeDescription },
  ]
  const tasks = [
    { icon: CalendarCheck, title: t.landing.previewAttendance, description: t.workspace.attendanceHint, href: "/login?callbackUrl=%2Fattendance", color: "bg-teal-300/15 text-teal-200" },
    { icon: CalendarDays, title: t.landing.previewLeave, description: t.workspace.leaveHint, href: "/login?callbackUrl=%2Fleave", color: "bg-violet-300/15 text-violet-200" },
    { icon: FileText, title: t.landing.previewPayslip, description: t.workspace.payslipsHint, href: "/login?callbackUrl=%2Fpayslips", color: "bg-amber-300/15 text-amber-200" },
  ]
  const navigation = [
    { href: "#features", label: t.landing.navFeatures },
    { href: "#how-it-works", label: t.landing.navHowItWorks },
    { href: "#demo-accounts", label: t.landing.navRoles },
  ]

  return (
    <div className="min-h-screen bg-card">
      <a href="#main-content" className="sr-only fixed top-3 left-3 z-50 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only">{t.workspace.skipToContent}</a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-card/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 px-4 py-3 sm:px-8 sm:py-4 lg:flex-nowrap">
          {/* โลโก้ย่อขนาดบนมือถือ เพื่อให้แถวบนพอดีกับปุ่มเข้าสู่ระบบโดยไม่ล้น */}
          {/* A smaller logo on mobile keeps the top row from crowding the sign-in button. */}
          <Logo size="sm" className="sm:hidden" />
          <Logo size="lg" className="hidden sm:flex" />
          {/* ซ่อนลิงก์นำทางไว้จนจอกว้างพอ (lg) ให้รวมแถวเดียวกับโลโก้และปุ่มขวาได้จริง
              ต่ำกว่านั้นพื้นที่ไม่พอ เคยลองเปิดตั้งแต่ sm แล้วมันล้นจนตกไปเป็นอีกแถว
              แยกออกมาเป็น bar ต่างหาก เลยกลับมาซ่อนจนถึง lg เหมือนเดิม ผู้ใช้เลื่อนดู
              แต่ละ section แทนได้อยู่แล้วบนจอที่แคบกว่านี้ */}
          {/* Hidden until the viewport is wide enough (lg) to actually fit on one row
              with the logo and right-side buttons. Showing it from sm caused it to
              overflow and wrap into its own bordered row — a separate-looking bar —
              so it's hidden again below lg; users can still just scroll to each
              section on narrower screens. */}
          <nav aria-label={t.landing.pageNavigation} className="order-last mt-4 hidden w-full items-center justify-center gap-6 border-t pt-3 text-sm lg:order-none lg:mt-0 lg:flex lg:w-auto lg:border-0 lg:pt-0">
            {navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-md py-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link>)}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher /><ThemeToggle />
            {/* คงปุ่มเข้าสู่ระบบไว้ทุกขนาดจอ เดิมซ่อนหมดบนจอเล็กจนไม่มีทางกดจาก header เลย */}
            {/* Always visible, even on the smallest phones — it used to disappear entirely there. */}
            <LinkButton href="/login" role="link" className="ml-1 gap-1.5 rounded-xl px-3 sm:ml-2 sm:gap-2 sm:px-5">{t.auth.signIn}<ArrowUpRight className="size-4" /></LinkButton>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="relative overflow-hidden border-b">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,var(--color-primary)_-400%,transparent_65%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
            <div>
              <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-xs font-medium text-primary">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />{t.landing.badge}
              </p>
              <h1 className="text-[clamp(2.5rem,4.5vw,4.25rem)] leading-[1.2] font-semibold tracking-tight text-balance">
                {t.landing.headlinePrefix}<br /><span className="text-primary">{t.landing.headlineAccent}</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground sm:text-lg">{t.app.tagline}</p>
              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <LinkButton href="/login" role="link" size="lg" className="h-13 rounded-xl px-6 shadow-lg shadow-primary/15">{t.landing.exploreDemo}<ArrowRight className="size-4" /></LinkButton>
                <LinkButton href="#features" role="link" variant="outline" size="lg" className="h-13 rounded-xl px-6">{t.landing.discoverFeatures}<ArrowDown className="size-4" /></LinkButton>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground">
                {[t.landing.benefitLanguage, t.landing.benefitRoles, t.landing.benefitMobile].map((benefit) => <span key={benefit} className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" aria-hidden="true" />{benefit}</span>)}
              </div>
            </div>

            <div className="relative rounded-[28px] bg-[#101f3c] p-5 text-white shadow-2xl shadow-primary/15 sm:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(ellipse_at_100%_0%,#294b82_0%,transparent_65%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-5">
                  <div className="flex items-center gap-2.5"><BrandMark className="size-8" /><span className="font-semibold tracking-tight">HRFlow<span className="text-sky-300">.</span></span></div>
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-blue-200">{t.landing.previewLabel}</span>
                </div>
                <p className="mt-7 text-xs text-blue-200">{t.auth.heroEyebrow}</p>
                <h2 className="mt-2 text-2xl leading-snug font-semibold tracking-tight">{t.landing.previewTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{t.landing.previewHint}</p>
                <div className="mt-6 space-y-3">
                  {tasks.map(({ icon: Icon, ...task }) => (
                    <Link key={task.href} href={task.href} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-sky-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:gap-4">
                      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${task.color}`}><Icon className="size-5" aria-hidden="true" /></span>
                      <div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{task.title}</h3><p className="mt-1 text-xs leading-5 text-slate-300">{task.description}</p></div>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-300" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-sky-300/10 px-4 py-3 text-xs leading-5 text-blue-100"><ShieldCheck className="size-5 shrink-0 text-sky-300" aria-hidden="true" />{t.landing.previewFooter}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-40 bg-background/65 py-16 sm:py-24 lg:scroll-mt-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-10 grid items-end gap-4 lg:grid-cols-2 lg:gap-20">
              <div><p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">{t.landing.navFeatures}</p><h2 className="text-3xl leading-snug font-semibold tracking-tight text-balance sm:text-4xl">{t.landing.keyFeatures}</h2></div>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">{t.landing.featuresIntro}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, ...feature }, index) => (
                <article key={feature.title} className="rounded-2xl border bg-card p-6 sm:p-7">
                  <div className="flex items-center justify-between"><span className={`flex size-12 items-center justify-center rounded-2xl ${feature.color}`}><Icon className="size-6" aria-hidden="true" /></span><span className="font-mono text-xs text-muted-foreground/70" aria-hidden="true">0{index + 1}</span></div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">{feature.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-40 border-y py-16 sm:py-24 lg:scroll-mt-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div><p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">{t.landing.navHowItWorks}</p><h2 className="text-3xl leading-snug font-semibold tracking-tight text-balance">{t.landing.workflowTitle}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{t.landing.workflowHint}</p></div>
            <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <div className="mb-5 flex items-center gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 font-mono text-sm font-medium text-primary">0{index + 1}</span>{index < 2 && <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />}</div>
                  <h3 className="text-base font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="demo-accounts" className="scroll-mt-40 py-16 sm:py-24 lg:scroll-mt-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">{t.landing.navRoles}</p><h2 className="text-3xl leading-snug font-semibold tracking-tight text-balance sm:text-4xl">{t.landing.tryEveryRole}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{t.landing.tryEveryRoleDescription}</p></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {accounts.map(({ icon: Icon, ...account }) => (
                <article key={account.role} className="flex flex-col rounded-2xl border bg-background/50 p-6">
                  <Icon className="size-7 text-primary" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold">{account.role}</h3><p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">{account.description}</p>
                  <Link href="/login" className="mt-6 inline-flex min-h-11 items-center justify-between gap-3 rounded-md border-t pt-3 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${t.landing.tryRole}: ${account.role}`}>{t.landing.tryRole}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">{t.landing.passwordNote}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="relative overflow-hidden rounded-[28px] bg-[#101f3c] px-6 py-12 text-white sm:px-12 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,#245772_0%,transparent_65%)]" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div className="max-w-2xl"><h2 className="text-3xl leading-snug font-semibold tracking-tight text-balance sm:text-4xl">{t.landing.ctaTitle}</h2><p className="mt-4 text-sm leading-7 text-slate-300">{t.landing.ctaDescription}</p></div><LinkButton href="/login" role="link" size="lg" className="h-13 shrink-0 rounded-xl bg-white px-6 text-[#101f3c] hover:bg-blue-100">{t.landing.exploreDemo}<ArrowRight className="size-4" /></LinkButton></div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between"><Logo /><p className="max-w-2xl text-xs leading-6 text-muted-foreground">{t.landing.footerNote}</p></div>
      </footer>

      {/* ปุ่มลอยกลับขึ้นบน โผล่มาเองตอนเลื่อนลงมาไกลพอ แทนลิงก์ข้อความเดิมที่อยู่ท้ายสุดของหน้า */}
      {/* Floating back-to-top button that appears once scrolled down, replacing the old text link buried at the very bottom. */}
      <BackToTopButton label={t.landing.backToTop} />
    </div>
  )
}
