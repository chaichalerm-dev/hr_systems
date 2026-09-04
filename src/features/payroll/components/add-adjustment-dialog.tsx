"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTranslations } from "@/i18n/client"
import { addPayrollAdjustmentAction } from "../actions"

export function AddAdjustmentDialog({ payrollItemId, employeeName }: { payrollItemId: string; employeeName: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("INCOME")
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeItems = { INCOME: t.payroll.adjustmentIncome, DEDUCTION: t.payroll.adjustmentDeduction }

  async function handleSubmit() {
    setIsPending(true)
    setError(null)
    const formData = new FormData()
    formData.set("payrollItemId", payrollItemId)
    formData.set("type", type)
    formData.set("label", label)
    formData.set("amount", amount)
    formData.set("note", note)

    const result = await addPayrollAdjustmentAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      setError(t.payroll.errors[result.error])
      return
    }
    toast.success(t.payroll.adjustmentAdded)
    setOpen(false)
    setLabel("")
    setAmount("")
    setNote("")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <Plus className="size-3.5" />
        {t.payroll.adjust}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.payroll.adjustmentFor.replace("{name}", employeeName)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.payroll.adjustmentType}</Label>
            <Select items={typeItems} value={type} onValueChange={(value) => setType(value ?? "INCOME")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeItems).map(([value, l]) => (
                  <SelectItem key={value} value={value}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t.payroll.adjustmentLabel}</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.payroll.adjustmentLabelPlaceholder} />
          </div>
          <div className="space-y-2">
            <Label>{t.payroll.amount}</Label>
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t.payroll.note}</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            {isPending ? t.payroll.adding : t.payroll.addAdjustment}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
