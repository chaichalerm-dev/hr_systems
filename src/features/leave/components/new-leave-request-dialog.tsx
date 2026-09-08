"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { leaveRequestFormClientSchema, type LeaveRequestFormInput } from "@/validations/leave"
import { useTranslations } from "@/i18n/client"
import { formatLeaveError } from "../format-error"
import { submitLeaveRequestAction } from "../actions"

interface LeaveTypeOption {
  id: string
  name: string
}

export function NewLeaveRequestDialog({ leaveTypes }: { leaveTypes: LeaveTypeOption[] }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const leaveTypeItems = Object.fromEntries(leaveTypes.map((lt) => [lt.id, lt.name]))

  const form = useForm<LeaveRequestFormInput>({
    resolver: zodResolver(leaveRequestFormClientSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  })

  async function onSubmit(values: LeaveRequestFormInput) {
    setServerError(null)
    setIsPending(true)
    const formData = new FormData()
    formData.set("leaveTypeId", values.leaveTypeId)
    formData.set("startDate", format(values.startDate, "yyyy-MM-dd"))
    formData.set("endDate", format(values.endDate, "yyyy-MM-dd"))
    formData.set("reason", values.reason)

    const result = await submitLeaveRequestAction({ error: null }, formData)
    setIsPending(false)

    if (result.error) {
      setServerError(formatLeaveError(t, result))
      return
    }

    toast.success(t.leave.submitted)
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        {t.leave.newRequest}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.leave.requestLeave}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.leave.leaveType}</FormLabel>
                  <Select items={leaveTypeItems} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.leave.selectLeaveType} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.leave.startDate}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={format(field.value, "yyyy-MM-dd")}
                        onChange={(e) => field.onChange(e.target.valueAsDate ?? new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.leave.endDate}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={format(field.value, "yyyy-MM-dd")}
                        onChange={(e) => field.onChange(e.target.valueAsDate ?? new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.leave.reason}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder={t.leave.reasonPlaceholder} />
                  </FormControl>
                  <FormDescription>{t.leave.weekendNote}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? t.leave.submitting : t.leave.submitRequest}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
