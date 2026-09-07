"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, Search } from "lucide-react"
import type { Role } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/i18n/client"
import { NAV_ITEMS } from "./nav-config"

export function WorkspaceTools({ role }: { role: Role }) {
  const t = useTranslations()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const current = items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const results = items.filter((item) => `${t.nav[item.labelKey]} ${item.href}`.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="flex min-w-0 items-center gap-5">
      <div className="hidden items-center gap-2 text-sm lg:flex">
        <span className="text-muted-foreground">{t.workspace.label}</span>
        <span className="text-border">/</span>
        <span className="font-medium">{current ? t.nav[current.labelKey] : t.auth.myProfile}</span>
      </div>
      <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) setQuery("") }}>
        <DialogTrigger render={<Button variant="outline" className="gap-2 text-muted-foreground" aria-label={t.workspace.findPage} />}>
          <Search className="size-4" />
          <span className="hidden sm:inline">{t.workspace.findPage}</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.workspace.findPage}</DialogTitle>
            <DialogDescription>{t.workspace.findPageHint}</DialogDescription>
          </DialogHeader>
          <Input autoFocus aria-label={t.workspace.findPage} placeholder={t.workspace.findPage} value={query} onChange={(event) => setQuery(event.target.value)} />
          <nav aria-label={t.workspace.findPage} className="max-h-[50dvh] space-y-1 overflow-y-auto">
            {results.map(({ href, labelKey, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring">
                <Icon className="size-5 text-primary" />
                {t.nav[labelKey]}
                <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
            ))}
            {results.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t.common.noResults}</p>}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  )
}
