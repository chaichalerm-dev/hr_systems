import type { Metadata } from "next"
import Link from "next/link"
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Banknote,
  ShieldCheck,
  FileBarChart,
  LayoutDashboard,
  GitBranch,
  Database,
  Lock,
  ClipboardList,
  TestTube2,
  Rocket,
  ArrowRight,
} from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { LinkButton } from "@/components/shared/link-button"
import { APP_NAME } from "@/lib/constants"
import { getDictionary } from "@/i18n/server"
import type { Dictionary } from "@/i18n/dictionaries/en"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return {
    title: `${APP_NAME} — Modern HR Management`,
    description: t.app.tagline,
  }
}

const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "shadcn/ui",
  "Prisma",
  "PostgreSQL",
  "Auth.js",
  "Zod",
  "React Hook Form",
  "TanStack Table",
  "Recharts",
  "Vitest",
  "Playwright",
]

// Icons stay here; the copy comes from the dictionary so the page follows the
// viewer's language without duplicating the icon wiring per locale.
const featureList = (t: Dictionary) => [
  { icon: Users, title: t.landing.features.employees, description: t.landing.features.employeesDescription },
  { icon: CalendarCheck, title: t.landing.features.attendance, description: t.landing.features.attendanceDescription },
  { icon: CalendarDays, title: t.landing.features.leave, description: t.landing.features.leaveDescription },
  { icon: Banknote, title: t.landing.features.payroll, description: t.landing.features.payrollDescription },
  { icon: LayoutDashboard, title: t.landing.features.dashboard, description: t.landing.features.dashboardDescription },
  { icon: FileBarChart, title: t.landing.features.reports, description: t.landing.features.reportsDescription },
]

const highlightList = (t: Dictionary) => [
  { icon: Lock, title: t.landing.highlights.authorization, description: t.landing.highlights.authorizationDescription },
  { icon: GitBranch, title: t.landing.highlights.workflow, description: t.landing.highlights.workflowDescription },
  { icon: Banknote, title: t.landing.highlights.payroll, description: t.landing.highlights.payrollDescription },
  { icon: Database, title: t.landing.highlights.schema, description: t.landing.highlights.schemaDescription },
  { icon: ShieldCheck, title: t.landing.highlights.audit, description: t.landing.highlights.auditDescription },
  { icon: ClipboardList, title: t.landing.highlights.monolith, description: t.landing.highlights.monolithDescription },
  { icon: TestTube2, title: t.landing.highlights.testing, description: t.landing.highlights.testingDescription },
  { icon: Rocket, title: t.landing.highlights.deployment, description: t.landing.highlights.deploymentDescription },
]

const accountList = (t: Dictionary) => [
  { role: t.roles.ADMIN, email: "admin@hrflow.demo", description: t.landing.accounts.adminDescription },
  { role: t.roles.HR, email: "hr@hrflow.demo", description: t.landing.accounts.hrDescription },
  { role: t.roles.MANAGER, email: "manager@hrflow.demo", description: t.landing.accounts.managerDescription },
  { role: t.roles.EMPLOYEE, email: "employee@hrflow.demo", description: t.landing.accounts.employeeDescription },
]

export default async function LandingPage() {
  const t = await getDictionary()
  const features = featureList(t)
  const highlights = highlightList(t)
  const accounts = accountList(t)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <LinkButton href="/login">
            {t.auth.signIn}
            <ArrowRight className="size-4" />
          </LinkButton>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            {t.landing.badge}
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.landing.headlinePrefix}
            <span className="text-primary">{t.landing.headlineAccent}</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{t.app.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/login" size="lg">
              {t.landing.exploreDemo}
              <ArrowRight className="size-4" />
            </LinkButton>
            <LinkButton href="#demo-accounts" variant="outline" size="lg">
              {t.landing.viewDemoAccounts}
            </LinkButton>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t.landing.keyFeatures}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-xl border bg-card p-6 shadow-sm">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t.landing.engineeringHighlights}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.title}>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4.5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t.landing.techStack}
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {TECH_STACK.map((tech) => (
                <span key={tech} className="rounded-full border bg-card px-3 py-1.5 text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="demo-accounts" className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t.landing.tryEveryRole}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">{t.landing.tryEveryRoleDescription}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {accounts.map((account) => (
                <div key={account.email} className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{account.role}</h3>
                    <Link href="/login" className="text-xs text-primary hover:underline">
                      {t.auth.signIn} →
                    </Link>
                  </div>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">{account.email}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{account.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">{t.landing.passwordNote}</p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:px-6">
          <Logo iconOnly className="opacity-70" />
          <p>{t.landing.footerNote}</p>
        </div>
      </footer>
    </div>
  )
}
