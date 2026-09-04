import { ShieldAlert } from "lucide-react"

import { LinkButton } from "@/components/shared/link-button"
import { getDictionary } from "@/i18n/server"

export default async function UnauthorizedPage() {
  const t = await getDictionary()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{t.auth.noAccess}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t.auth.noAccessDescription}</p>
      </div>
      <LinkButton href="/dashboard">{t.auth.backToDashboard}</LinkButton>
    </div>
  )
}
