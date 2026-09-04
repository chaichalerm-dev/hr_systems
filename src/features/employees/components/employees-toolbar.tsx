"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { Search } from "lucide-react"
import { EmploymentStatus } from "@prisma/client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/i18n/client"

export function EmployeesToolbar({
  departments,
}: {
  departments: { id: string; name: string }[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [, startTransition] = useTransition()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const statusLabels = useMemo(
    () =>
      Object.fromEntries(
        Object.values(EmploymentStatus).map((value) => [value, t.status[value]])
      ) as Record<EmploymentStatus, string>,
    [t]
  )

  const departmentItems = useMemo(
    () => ({ all: t.employees.allDepartments, ...Object.fromEntries(departments.map((d) => [d.id, d.name])) }),
    [departments, t]
  )
  const statusItems = useMemo(() => ({ all: t.employees.allStatuses, ...statusLabels }), [statusLabels, t])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            updateParam("search", e.target.value || null)
          }}
          placeholder={t.employees.searchPlaceholder}
          className="pl-8"
        />
      </div>

      <Select
        items={departmentItems}
        value={searchParams.get("departmentId") ?? "all"}
        onValueChange={(value) => updateParam("departmentId", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t.employees.allDepartments} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.employees.allDepartments}</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={statusItems}
        value={searchParams.get("employmentStatus") ?? "all"}
        onValueChange={(value) => updateParam("employmentStatus", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t.employees.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.employees.allStatuses}</SelectItem>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
