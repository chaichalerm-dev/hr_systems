"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/client"

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">{t.common.somethingWentWrong}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.common.unexpectedError}</p>
      </div>
      <Button onClick={reset}>{t.common.tryAgain}</Button>
    </div>
  )
}
