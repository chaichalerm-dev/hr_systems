"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import type { Role } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/shared/logo"
import { useTranslations } from "@/i18n/client"
import { SidebarNav } from "./sidebar-nav"

export function MobileNav({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.openMenu} />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle render={<Logo />} />
        </SheetHeader>
        <div className="py-3">
          <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
