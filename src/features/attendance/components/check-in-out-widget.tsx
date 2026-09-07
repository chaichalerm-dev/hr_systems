"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { LogIn, LogOut, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { useTranslations } from "@/i18n/client"
import { checkInAction, checkOutAction } from "../actions"

function getLocation(): Promise<{ latitude?: number; longitude?: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({})
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve({}),
      { timeout: 3000 }
    )
  })
}

export function CheckInOutWidget({
  status,
  checkInTime,
  checkOutTime,
}: {
  status: string
  checkInTime: string | null
  checkOutTime: string | null
}) {
  const t = useTranslations()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [action, setAction] = useState<"in" | "out" | null>(null)

  function handleCheckIn() {
    setAction("in")
    startTransition(async () => {
      const location = await getLocation()
      const result = await checkInAction(location)
      if (result.error) toast.error(t.attendance[result.error])
      else toast.success(t.attendance.checkedIn)
      router.refresh()
    })
  }

  function handleCheckOut() {
    setAction("out")
    startTransition(async () => {
      const location = await getLocation()
      const result = await checkOutAction(location)
      if (result.error) toast.error(t.attendance[result.error])
      else toast.success(t.attendance.checkedOut)
      router.refresh()
    })
  }

  const hasCheckedIn = Boolean(checkInTime)
  const hasCheckedOut = Boolean(checkOutTime)

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">{t.attendance.todaysAttendance}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{hasCheckedOut ? t.workspace.dayComplete : hasCheckedIn ? t.workspace.workingNow : t.workspace.readyToCheckIn}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusBadge status={status} />
            <span className="text-sm text-muted-foreground">
              {t.attendance.inLabel} <span className="font-medium text-foreground">{checkInTime ?? "—"}</span> · {t.attendance.outLabel}{" "}
              <span className="font-medium text-foreground">{checkOutTime ?? "—"}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCheckIn} disabled={hasCheckedIn || isPending}>
            <LogIn className="size-4" />
            {isPending && action === "in" ? t.attendance.checkingIn : t.attendance.checkIn}
          </Button>
          <Button variant={hasCheckedIn && !hasCheckedOut ? "default" : "outline"} onClick={handleCheckOut} disabled={!hasCheckedIn || hasCheckedOut || isPending}>
            <LogOut className="size-4" />
            {isPending && action === "out" ? t.attendance.checkingOut : t.attendance.checkOut}
          </Button>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {t.attendance.locationNote}
      </p>
    </div>
  )
}
