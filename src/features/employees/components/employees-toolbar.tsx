"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Loader2, Search, X } from "lucide-react"
import { EmploymentStatus } from "@prisma/client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  const [isPending, startTransition] = useTransition()
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestSearch = useRef<string | null>(null)
  const urlSearch = searchParams.get("search") ?? ""

  function cancelSearch() {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = null
  }

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
  }, [])

  useEffect(() => {
    // ซิงก์ข้อความกับ URL โดยไม่ให้ผลค้นหาเก่าทับข้อความที่กำลังพิมพ์ใหม่
    // Sync browser navigation without letting an older response overwrite newer typing.
    if (latestSearch.current === null || latestSearch.current === urlSearch) {
      latestSearch.current = null
      setSearch(urlSearch)
    }
  }, [urlSearch])

  useEffect(() => {
    function restoreSearch() {
      if (searchTimer.current) clearTimeout(searchTimer.current)
      searchTimer.current = null
      latestSearch.current = null
      setSearch(new URLSearchParams(window.location.search).get("search") ?? "")
    }
    window.addEventListener("popstate", restoreSearch)
    return () => window.removeEventListener("popstate", restoreSearch)
  }, [])

  function updateParam(key: string, value: string | null) {
    cancelSearch()
    const params = new URLSearchParams(searchParams.toString())
    const nextSearch = key === "search" ? value ?? "" : search
    latestSearch.current = nextSearch
    if (nextSearch) params.set("search", nextSearch)
    else params.delete("search")
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }))
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
    <div aria-busy={isPending} className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
      <div className="w-full min-w-0 sm:w-auto sm:flex-1">
        <label htmlFor="employee-search" className="mb-2 block text-xs font-medium text-muted-foreground">{t.common.search}</label>
        <div className="relative">
        {isPending ? <Loader2 aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 motion-safe:animate-spin text-muted-foreground" /> : <Search aria-hidden="true" className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />}
        <Input
          id="employee-search"
          value={search}
          onChange={(e) => {
            const value = e.target.value
            setSearch(value)
            latestSearch.current = value
            cancelSearch()
            // รอให้หยุดพิมพ์สั้น ๆ แล้วค่อยค้นหา ลดคำขอซ้ำทุกตัวอักษร
            // Search after a short typing pause instead of requesting on every keystroke.
            searchTimer.current = setTimeout(() => updateParam("search", value || null), 350)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) updateParam("search", search || null)
          }}
          placeholder={t.employees.searchPlaceholder}
          className="pl-10"
        />
        </div>
      </div>

      <div className="w-full sm:w-48">
      <span id="department-filter-label" className="mb-2 block text-xs font-medium text-muted-foreground">{t.employees.department}</span>
      <Select
        items={departmentItems}
        value={searchParams.get("departmentId") ?? "all"}
        onValueChange={(value) => updateParam("departmentId", value === "all" ? null : value)}
      >
        <SelectTrigger aria-labelledby="department-filter-label" className="w-full">
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
      </div>

      <div className="w-full sm:w-44">
      <span id="status-filter-label" className="mb-2 block text-xs font-medium text-muted-foreground">{t.common.status}</span>
      <Select
        items={statusItems}
        value={searchParams.get("employmentStatus") ?? "all"}
        onValueChange={(value) => updateParam("employmentStatus", value === "all" ? null : value)}
      >
        <SelectTrigger aria-labelledby="status-filter-label" className="w-full">
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
      {(search || searchParams.get("departmentId") || searchParams.get("employmentStatus")) && (
        <Button variant="ghost" onClick={() => { cancelSearch(); latestSearch.current = null; setSearch(""); startTransition(() => router.replace(pathname, { scroll: false })) }}>
          <X className="size-4" />{t.workspace.clearFilters}
        </Button>
      )}
    </div>
  )
}
