"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { th as thDateLocale } from "date-fns/locale"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useI18n } from "@/i18n/client"
import { generatePayrollRunAction } from "../actions"

export function GeneratePayrollDialog() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [isPending, setIsPending] = useState(false)

  const monthItems = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [
      String(i + 1),
      format(new Date(2000, i, 1), "MMMM", locale === "th" ? { locale: thDateLocale } : undefined),
    ])
  )

  const yearItems = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((y) => [String(y), String(y)])
  )

  async function handleGenerate() {
    setIsPending(true)
    const formData = new FormData()
    formData.set("month", month)
    formData.set("year", year)
    const result = await generatePayrollRunAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      toast.error(t.payroll.errors[result.error])
      return
    }
    toast.success(t.payroll.generated)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        {t.payroll.generatePayroll}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.payroll.generatePayrollRun}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.payroll.month}</Label>
            <Select items={monthItems} value={month} onValueChange={(value) => setMonth(value ?? month)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(monthItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t.payroll.year}</Label>
            <Select items={yearItems} value={year} onValueChange={(value) => setYear(value ?? year)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(yearItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t.payroll.regenerateNote}
        </p>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleGenerate}>
            {isPending ? t.payroll.generating : t.payroll.generate}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
