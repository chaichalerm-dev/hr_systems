"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { attendanceRulesFormClientSchema, type AttendanceRulesFormInput } from "@/validations/attendance"
import { updateAttendanceRulesAction } from "../actions"
import type { AttendanceRules } from "@/server/services/attendance-rules"
import { useTranslations } from "@/i18n/client"

export function AttendanceRulesForm({ initial }: { initial: AttendanceRules }) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<AttendanceRulesFormInput>({
    resolver: zodResolver(attendanceRulesFormClientSchema),
    defaultValues: initial,
  })

  async function onSubmit(values: AttendanceRulesFormInput) {
    setIsPending(true)
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => formData.set(key, String(value)))

    const result = await updateAttendanceRulesAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      toast.error(t.settings[result.error])
      return
    }
    toast.success(t.settings.attendanceRulesUpdated)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.workStart}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="09:00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.workEnd}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="18:00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gracePeriodMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.gracePeriod}</FormLabel>
                <FormControl>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    type="number"
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="standardWorkingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.settings.standardWorkingHours}</FormLabel>
                <FormControl>
                  <Input
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    type="number"
                    min={1}
                    max={24}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? t.common.saving : t.settings.saveAttendanceRules}
        </Button>
      </form>
    </Form>
  )
}
