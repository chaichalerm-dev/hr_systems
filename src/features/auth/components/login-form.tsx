"use client"

import { useActionState, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle, ArrowRight, Check, ChevronDown, Eye, EyeOff, FlaskConical, Loader2, LockKeyhole, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/i18n/client"
import { loginAction, type LoginActionState } from "../actions"

const DEMO_ACCOUNTS = [
  { role: "ADMIN", email: "admin@hrflow.demo", password: "Admin@12345" },
  { role: "HR", email: "hr@hrflow.demo", password: "Hr@12345" },
  { role: "MANAGER", email: "manager@hrflow.demo", password: "Manager@12345" },
  { role: "EMPLOYEE", email: "employee@hrflow.demo", password: "Employee@12345" },
] as const

const initialState: LoginActionState = { error: null }

export function LoginForm() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full space-y-7">
      <form action={formAction} className="space-y-5" aria-busy={isPending}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-13 rounded-xl pl-11"
              aria-describedby={state.error ? "login-error" : undefined}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-13 rounded-xl pr-12 pl-11"
              aria-describedby={state.error ? "login-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              aria-pressed={showPassword}
              className="absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {state.error && (
          <p id="login-error" role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t.auth[state.error]}
          </p>
        )}
        <Button type="submit" className="h-13 w-full rounded-xl text-base shadow-lg shadow-primary/15" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isPending ? t.auth.signingIn : t.auth.signIn}
          {!isPending && <ArrowRight className="ml-1 size-[18px]" aria-hidden="true" />}
        </Button>
      </form>

      <details className="group rounded-xl border bg-muted/25 open:bg-muted/40">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors select-none hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <FlaskConical className="size-[18px] shrink-0 text-primary" aria-hidden="true" />
          <span className="flex-1">{t.auth.tryDemo}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-xs leading-5 text-muted-foreground">{t.auth.demoHint}</p>
          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => {
              const selected = email === account.email && password === account.password
              return (
                <button
                  type="button"
                  key={account.role}
                  disabled={isPending}
                  aria-pressed={selected}
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className={`min-w-0 rounded-lg border bg-card px-3 py-3 text-left text-xs transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${selected ? "border-primary ring-1 ring-primary/20" : "border-border"}`}
                >
                  <span className="mb-1 flex items-center justify-between gap-1 font-medium">{t.roles[account.role]}{selected && <Check className="size-3.5 shrink-0 text-primary" aria-hidden="true" />}</span>
                  <span className="block truncate text-muted-foreground">{account.email}</span>
                </button>
              )
            })}
          </div>
        </div>
      </details>
    </div>
  )
}
