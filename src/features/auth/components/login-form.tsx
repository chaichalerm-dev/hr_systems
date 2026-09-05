"use client"

import { useActionState, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

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
    <div className="w-full max-w-sm space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hrflow.demo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {t.auth[state.error]}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t.auth.signIn}
        </Button>
      </form>

      <div className="space-y-2 border-t pt-4">
        <p className="text-center text-xs text-muted-foreground">{t.auth.demoAccounts}</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              type="button"
              key={account.role}
              onClick={() => {
                setEmail(account.email)
                setPassword(account.password)
              }}
              className="rounded-lg border px-3 py-2 text-left text-xs transition-colors hover:bg-accent"
            >
              <div className="font-medium">{t.roles[account.role]}</div>
              <div className="truncate text-muted-foreground">{account.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
