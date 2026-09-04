"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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

  const selectedDepartmentId = form.watch("departmentId")
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">{t.employees.basicInformation}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.employeeCode}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="EMP0001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.auth.email}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.firstName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.lastName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.phone}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="081-234-5678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">{t.employees.employmentSection}</h2>
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

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">{t.employees.addressSection}</h2>
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
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.city}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.province}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.postalCode}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.country}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">{t.employees.emergencyContact}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.name}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.phone}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContactRelation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.relationship}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Spouse, Parent..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">{t.employees.bankingSection}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.bankName}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.bankAccountNumber}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.taxId}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialSecurityNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.employees.socialSecurityNo}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <div className="flex items-center gap-2 border-t pt-6">
          <Button type="submit" disabled={isPending}>
            {mode === "create" ? t.employees.createEmployee : t.employees.saveChanges}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
