"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { payrollRulesFormClientSchema, type PayrollRulesFormInput } from "@/validations/payroll"
import { updatePayrollRulesAction } from "../actions"
import type { PayrollRules } from "@/server/services/payroll-engine"
import { useTranslations } from "@/i18n/client"

function NumberField({
  control,
  name,
  label,
  description,
  step = "0.01",
}: {
  control: ReturnType<typeof useForm<PayrollRulesFormInput>>["control"]
  name: keyof PayrollRulesFormInput
  label: string
  description?: string
  step?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              type="number"
              step={step}
              min={0}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function PayrollRulesForm({ initial }: { initial: PayrollRules }) {
  const t = useTranslations()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<PayrollRulesFormInput>({
    resolver: zodResolver(payrollRulesFormClientSchema),
    defaultValues: initial,
  })

  async function onSubmit(values: PayrollRulesFormInput) {
    setIsPending(true)
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, String(value)))

    const result = await updatePayrollRulesAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      toast.error(t.settings[result.error])
      return
    }
    toast.success(t.settings.payrollRulesUpdated)
    // ตั้งค่าที่เพิ่งบันทึกให้เป็นค่าฐานใหม่ ปุ่มจะได้กลับไปกดไม่ได้จนกว่าจะแก้จริง
    // Reset the dirty baseline to what was just saved, so Save disables again until it's actually edited.
    form.reset(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            control={form.control}
            name="socialSecurityRate"
            label={t.settings.socialSecurityRate}
            description={t.settings.socialSecurityRateHint}
          />
          <NumberField control={form.control} name="socialSecurityMaxBase" label={t.settings.socialSecurityMaxBase} step="1" />
          <NumberField control={form.control} name="withholdingTaxRate" label={t.settings.withholdingTaxRate} description={t.settings.withholdingTaxRateHint} />
          <NumberField control={form.control} name="lateDeductionPerMinute" label={t.settings.lateDeductionPerMinute} step="1" />
          <NumberField
            control={form.control}
            name="absenceDeductionDivisor"
            label={t.settings.absenceDeductionDivisor}
            description={t.settings.absenceDeductionHint}
            step="1"
          />
        </div>
        {/* กันกดบันทึกทั้งที่ยังไม่ได้แก้อะไร จะได้ไม่งงว่าเซฟอะไรไป */}
        {/* Disabled until something actually changes, so there's no confusion about what got saved. */}
        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? t.common.saving : t.settings.savePayrollRules}
        </Button>
      </form>
    </Form>
  )
}
