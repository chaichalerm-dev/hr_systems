"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { endOfDay, startOfDay } from "date-fns"

import { prisma } from "@/db/client"
import { requireSession } from "@/server/authorization"
import { getAttendanceRules } from "@/server/services/company-settings"
import { calculateWorkingHours, isLateCheckIn } from "@/server/services/attendance-rules"
import { recordAuditLog } from "@/server/services/audit-log"
import { AttendanceStatus } from "@prisma/client"
import { checkInSchema, checkOutSchema } from "@/validations/attendance"

/** Error codes, not sentences — the client renders them in the viewer's language. */
export type AttendanceErrorCode =
  | "noEmployeeProfile"
  | "invalidInput"
  | "alreadyCheckedIn"
  | "alreadyCheckedOut"
  | "mustCheckInFirst"

export interface AttendanceActionState {
  error: AttendanceErrorCode | null
}

async function getRequestContext() {
  const headerList = await headers()
  return {
    ipAddress: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    device: headerList.get("user-agent")?.slice(0, 200) ?? null,
  }
}

export async function checkInAction(input: unknown): Promise<AttendanceActionState> {
  const session = await requireSession()
  if (!session.user.employeeId) return { error: "noEmployeeProfile" }

  const parsed = checkInSchema.safeParse(input)
  if (!parsed.success) return { error: "invalidInput" }

  const existing = await prisma.attendance.findFirst({
    where: {
      employeeId: session.user.employeeId,
      date: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
    },
  })
  if (existing?.checkIn) return { error: "alreadyCheckedIn" }

  const rules = await getAttendanceRules()
  const now = new Date()
  const status = isLateCheckIn(now, rules) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT
  const { ipAddress, device } = await getRequestContext()

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: session.user.employeeId, date: startOfDay(now) } },
    create: {
      employeeId: session.user.employeeId,
      date: startOfDay(now),
      checkIn: now,
      status,
      checkInLatitude: parsed.data.latitude,
      checkInLongitude: parsed.data.longitude,
      checkInIpAddress: ipAddress,
      checkInDevice: device,
    },
    update: {
      checkIn: now,
      status,
      checkInLatitude: parsed.data.latitude,
      checkInLongitude: parsed.data.longitude,
      checkInIpAddress: ipAddress,
      checkInDevice: device,
    },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "ATTENDANCE_CHECKED_IN",
    entity: "Attendance",
    entityId: session.user.employeeId,
    metadata: { status },
  })

  revalidatePath("/attendance")
  revalidatePath("/dashboard")
  return { error: null }
}

export async function checkOutAction(input: unknown): Promise<AttendanceActionState> {
  const session = await requireSession()
  if (!session.user.employeeId) return { error: "noEmployeeProfile" }

  const parsed = checkOutSchema.safeParse(input)
  if (!parsed.success) return { error: "invalidInput" }

  const today = await prisma.attendance.findFirst({
    where: {
      employeeId: session.user.employeeId,
      date: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) },
    },
  })
  if (!today?.checkIn) return { error: "mustCheckInFirst" }
  if (today.checkOut) return { error: "alreadyCheckedOut" }

  const now = new Date()
  const { ipAddress, device } = await getRequestContext()

  await prisma.attendance.update({
    where: { id: today.id },
    data: {
      checkOut: now,
      workingHours: calculateWorkingHours(today.checkIn, now),
      checkOutLatitude: parsed.data.latitude,
      checkOutLongitude: parsed.data.longitude,
      checkOutIpAddress: ipAddress,
      checkOutDevice: device,
    },
  })

  await recordAuditLog({
    actorId: session.user.id,
    action: "ATTENDANCE_CHECKED_OUT",
    entity: "Attendance",
    entityId: session.user.employeeId,
    metadata: {},
  })

  revalidatePath("/attendance")
  revalidatePath("/dashboard")
  return { error: null }
}
