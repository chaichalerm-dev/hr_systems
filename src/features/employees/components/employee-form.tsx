"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { format } from "date-fns"
import { EmploymentStatus, EmploymentType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { employeeFormClientSchema, type EmployeeFormInput } from "@/validations/employee"
import { useTranslations } from "@/i18n/client"
import { createEmployeeAction, updateEmployeeAction, type EmployeeActionState } from "../actions"

interface Department {
  id: string
  name: string
}
interface Position {
  id: string
  title: string
  departmentId: string
}
interface ManagerOption {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
}

type StringFieldName =
  | "employeeCode"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "city"
  | "province"
  | "postalCode"
  | "country"
  | "emergencyContactName"
  | "emergencyContactPhone"
  | "emergencyContactRelation"
  | "bankName"
  | "bankAccountNumber"
  | "taxId"
  | "socialSecurityNo"

function TextField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className,
}: {
  control: Control<EmployeeFormInput>
  name: StringFieldName
  label: string
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} type={type} placeholder={placeholder} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function toFormData(values: EmployeeFormInput): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue
    if (value instanceof Date) {
      formData.set(key, format(value, "yyyy-MM-dd"))
    } else {
      formData.set(key, String(value))
    }
  }
  return formData
}

export function EmployeeForm({
  mode,
  employeeId,
  defaultValues,
  departments,
  positions,
  managers,
}: {
  mode: "create" | "edit"
  employeeId?: string
  defaultValues?: Partial<EmployeeFormInput>
  departments: Department[]
  positions: Position[]
  managers: ManagerOption[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<EmployeeFormInput>({
    resolver: zodResolver(employeeFormClientSchema),
    defaultValues: {
      employeeCode: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      departmentId: "",
      positionId: "",
      employmentType: EmploymentType.FULL_TIME,
      employmentStatus: EmploymentStatus.ACTIVE,
      salary: 0,
      startDate: new Date(),
      managerId: "",
      country: "Thailand",
      ...defaultValues,
    },
  })

  const selectedDepartmentId = useWatch({ control: form.control, name: "departmentId" })
  const filteredPositions = useMemo(
    () => positions.filter((p) => p.departmentId === selectedDepartmentId),
    [positions, selectedDepartmentId]
  )

  // Base UI's <Select.Value> only shows the matching label automatically
  // when the root is given this value->label map; otherwise it renders the
  // raw stored value (e.g. a department id) instead of its display name.
  const departmentItems = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments])
  const positionItems = useMemo(
    () => Object.fromEntries(filteredPositions.map((p) => [p.id, p.title])),
    [filteredPositions]
  )
  const employmentTypeLabels = useMemo(
    () => Object.fromEntries(Object.values(EmploymentType).map((v) => [v, t.employmentType[v]])) as Record<EmploymentType, string>,
    [t]
  )
  const employmentStatusLabels = useMemo(
    () => Object.fromEntries(Object.values(EmploymentStatus).map((v) => [v, t.status[v]])) as Record<EmploymentStatus, string>,
    [t]
  )
  const managerItems = useMemo(
    () => ({
      none: t.employees.noManager,
      ...Object.fromEntries(managers.map((m) => [m.id, `${m.firstName} ${m.lastName} (${m.employeeCode})`])),
    }),
    [managers, t]
  )

  async function onSubmit(values: EmployeeFormInput) {
    setServerError(null)
    const formData = toFormData(values)

    startTransition(async () => {
      let result: EmployeeActionState
      if (mode === "create") {
        result = await createEmployeeAction({ error: null, success: false }, formData)
      } else {
        result = await updateEmployeeAction(employeeId!, { error: null, success: false }, formData)
      }

      if (result.error) {
        setServerError(result.error)
        return
      }

      toast.success(mode === "create" ? t.employees.created : t.employees.updated)
      router.push(mode === "create" ? "/employees" : `/employees/${employeeId}`)
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="employee-form space-y-5">
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{t.workspace.formHint}</p>
          <nav aria-label={t.workspace.onThisPage} className="mt-3 flex flex-wrap gap-2">
            {[t.employees.basicInformation, t.employees.employmentSection, t.employees.addressSection, t.employees.emergencyContact, t.employees.bankingSection].map((label, index) => (
              <a key={label} href={`#employee-section-${index}`} className="rounded-lg border bg-card px-3 py-2 text-xs font-medium hover:border-primary hover:text-primary">{index + 1}. {label}</a>
            ))}
          </nav>
        </div>
        <section id="employee-section-0" className="scroll-mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-3 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">01</span>{t.employees.basicInformation}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="employeeCode" label={t.employees.employeeCode} placeholder="EMP0001" />
            <TextField control={form.control} name="email" label={t.auth.email} type="email" />
            <TextField control={form.control} name="firstName" label={t.employees.firstName} />
            <TextField control={form.control} name="lastName" label={t.employees.lastName} />
            <TextField control={form.control} name="phone" label={t.employees.phone} placeholder="081-234-5678" />
          </div>
        </section>

        <section id="employee-section-1" className="scroll-mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-3 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">02</span>{t.employees.employmentSection}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.department}</FormLabel>
                  <Select
                    items={departmentItems}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue("positionId", "")
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.employees.selectDepartment} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.position}</FormLabel>
                  <Select
                    items={positionItems}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedDepartmentId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.employees.selectPosition} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPositions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.employmentType}</FormLabel>
                  <Select items={employmentTypeLabels} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(employmentTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.employmentStatus}</FormLabel>
                  <Select items={employmentStatusLabels} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(employmentStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.manager}</FormLabel>
                  <Select
                    items={managerItems}
                    value={field.value || "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t.employees.noManager} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t.employees.noManager}</SelectItem>
                      {managers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.startDate}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? format(field.value, "yyyy-MM-dd") : field.value}
                      onChange={(e) => field.onChange(e.target.valueAsDate ?? new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.monthlySalary}</FormLabel>
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      type="number"
                      min={0}
                      step="0.01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section id="employee-section-2" className="scroll-mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-3 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">03</span>{t.employees.addressSection}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t.employees.address}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField control={form.control} name="city" label={t.employees.city} />
            <TextField control={form.control} name="province" label={t.employees.province} />
            <TextField control={form.control} name="postalCode" label={t.employees.postalCode} />
            <TextField control={form.control} name="country" label={t.employees.country} />
          </div>
        </section>

        <section id="employee-section-3" className="scroll-mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-3 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">04</span>{t.employees.emergencyContact}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField control={form.control} name="emergencyContactName" label={t.employees.name} />
            <TextField control={form.control} name="emergencyContactPhone" label={t.employees.phone} />
            <TextField
              control={form.control}
              name="emergencyContactRelation"
              label={t.employees.relationship}
              placeholder="Spouse, Parent..."
            />
          </div>
        </section>

        <section id="employee-section-4" className="scroll-mt-6 space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-3 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">05</span>{t.employees.bankingSection}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={form.control} name="bankName" label={t.employees.bankName} />
            <TextField control={form.control} name="bankAccountNumber" label={t.employees.bankAccountNumber} />
            <TextField control={form.control} name="taxId" label={t.employees.taxId} />
            <TextField control={form.control} name="socialSecurityNo" label={t.employees.socialSecurityNo} />
          </div>
        </section>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur-sm">
          <Button type="submit" disabled={isPending}>
            {isPending ? t.common.saving : mode === "create" ? t.employees.createEmployee : t.employees.saveChanges}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
