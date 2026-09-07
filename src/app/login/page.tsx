import { Suspense } from "react"
import type { Metadata } from "next"
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, Layers3, Users, Wallet } from "lucide-react"

import { BrandMark, Logo } from "@/components/shared/logo"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { LinkButton } from "@/components/shared/link-button"
import { LoginForm } from "@/features/auth/components/login-form"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function LoginPage() {
  const t = await getDictionary()
  const modules = [
    { icon: Users, label: t.nav.employees, color: "bg-blue-400/15 text-blue-200" },
    { icon: Clock3, label: t.nav.attendance, color: "bg-teal-400/15 text-teal-200" },
    { icon: CalendarDays, label: t.nav.leave, color: "bg-violet-400/15 text-violet-200" },
    { icon: Wallet, label: t.nav.payroll, color: "bg-amber-400/15 text-amber-200" },
  ]

  return (
    <main className="grid min-h-svh bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside className="relative m-3 hidden overflow-hidden rounded-[28px] bg-[#101f3c] text-white lg:flex lg:flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,#294b82_0%,transparent_60%),radial-gradient(ellipse_at_100%_90%,#174d66_0%,transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#b2cdf3_1px,transparent_1px)] bg-size-[24px_24px]" />
        <div className="relative flex flex-1 flex-col px-10 py-9 xl:px-14 xl:py-11">
          <div className="flex items-center gap-3">
            <BrandMark className="size-10" />
            <span className="text-2xl font-semibold tracking-tight">HRFlow<span className="text-sky-300">.</span></span>
          </div>

          <div className="my-auto py-12 xl:py-16">
            <p className="mb-6 flex items-center gap-2.5 text-sm font-medium text-blue-200">
              <span className="h-px w-7 bg-sky-300" aria-hidden="true" />
              {t.auth.heroEyebrow}
            </p>
            <h2 className="max-w-lg text-[clamp(2.25rem,3.45vw,3.5rem)] leading-[1.35] font-semibold tracking-tight text-balance">
              {t.auth.heroTitle}<br />
              <span className="text-sky-300">{t.auth.heroAccent}</span>
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">{t.app.tagline}</p>

            <div className="relative mt-12 max-w-md">
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-2xl border border-white/10 bg-white/5" />
              <div className="relative rounded-2xl border border-white/15 bg-[#192e50]/90 p-5 shadow-2xl shadow-black/15 xl:p-6">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-white/10"><Layers3 className="size-4 text-blue-200" aria-hidden="true" /></span>
                    <span className="text-sm font-medium">{t.auth.workspaceTitle}</span>
                  </div>
                  <span className="flex gap-1" aria-hidden="true"><span className="size-1 rounded-full bg-slate-400" /><span className="size-1 rounded-full bg-slate-400" /><span className="size-1 rounded-full bg-slate-400" /></span>
                </div>
                <ul className="grid grid-cols-2 gap-3">
                  {modules.map(({ icon: Icon, label, color }) => (
                    <li key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-4">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${color}`}><Icon className="size-[18px]" aria-hidden="true" /></span>
                      <span className="text-sm text-slate-100">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 border-t border-white/15 pt-6 text-sm text-slate-300">
            <p>{t.auth.heroFooter}</p>
            <ArrowUpRight className="size-5 shrink-0 text-sky-300" aria-hidden="true" />
          </div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col" aria-labelledby="login-heading">
        <header className="flex items-center justify-between gap-2 px-4 py-4 sm:px-8 sm:py-6">
          <LinkButton href="/" variant="ghost" size="sm" className="min-h-11 text-muted-foreground">
            <ArrowLeft className="size-4" />
            {t.auth.backToHome}
          </LinkButton>
          <div className="flex items-center gap-1"><LanguageSwitcher /><ThemeToggle /></div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10 sm:py-12">
          <div className="w-full max-w-[400px]">
            <Logo size="lg" className="mb-10 lg:hidden" />
            <div className="mb-8 space-y-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{t.auth.signInEyebrow}</p>
              <h1 id="login-heading" className="text-3xl leading-snug font-semibold tracking-tight sm:text-4xl">{t.auth.welcomeBack}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{t.auth.signInHint}</p>
            </div>
            <Suspense fallback={<p className="py-12 text-sm text-muted-foreground" role="status">{t.common.loading}</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <footer className="px-6 pb-6 text-center text-xs leading-5 text-muted-foreground sm:pb-8">
          {t.auth.accountHelp}
        </footer>
      </section>
    </main>
  )
}
