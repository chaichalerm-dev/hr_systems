"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/i18n/client"

export function PrintButton() {
  const t = useTranslations()

  return (
    <Button variant="outline" className="no-print" onClick={() => window.print()}>
      <Printer className="size-4" />
      {t.common.print}
    </Button>
  )
}
