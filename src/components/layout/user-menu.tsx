"use client"

import { LogOut, User as UserIcon } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOutAction } from "@/features/auth/actions"
import { useTranslations } from "@/i18n/client"
import type { Dictionary } from "@/i18n/dictionaries/en"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UserMenu({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: string
}) {
  const t = useTranslations()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
            <span className="mt-1 w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {t.roles[role as keyof Dictionary["roles"]] ?? role}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserIcon className="size-4" />
          {t.auth.myProfile}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
          <LogOut className="size-4" />
          {t.auth.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
