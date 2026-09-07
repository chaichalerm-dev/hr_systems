import { Suspense } from "react"
import type { Metadata } from "next"

import { Logo } from "@/components/shared/logo"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { LoginForm } from "@/features/auth/components/login-form"
import { getDictionary } from "@/i18n/server"

export const metadata: Metadata = {
  title: "Sign in",
}

export default async function LoginPage() {
  const t = await getDictionary()

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground">{t.app.tagline}</p>
        </div>
        <div className="w-full rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-xs text-muted-foreground">{t.auth.loginFooter}</p>
      </div>
    </div>
  )
}
