import "server-only"

import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import type { Session } from "next-auth"

import { auth } from "@/server/auth"

export * from "./permissions"

export class ForbiddenError extends Error {
  constructor(message = "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้ / Your account cannot perform this action.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "กรุณาเข้าสู่ระบบก่อน / Please sign in first.") {
    super(message)
    this.name = "UnauthenticatedError"
  }
}

/** อ่านผู้ใช้ที่ล็อกอินอยู่ หากไม่มีให้ส่งข้อผิดพลาด ใช้ใน action และ API
 * Read the session or throw an error; use this in actions and route handlers.
 */
export async function requireSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) throw new UnauthenticatedError()
  return session
}

/** อ่านเซสชันแล้วตรวจว่าบทบาทอยู่ในรายการที่อนุญาต
 * Read the session and check that its role is allowed.
 */
export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await requireSession()
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(`รายการนี้ให้เฉพาะบทบาทต่อไปนี้ใช้งาน / Allowed roles: ${roles.join(", ")}.`)
  }
  return session
}

/** สำหรับหน้าเว็บ ให้พาไปล็อกอินหรือหน้าไม่มีสิทธิ์ ส่วน action และ API ใช้ requireRole เพื่อส่งข้อผิดพลาด
 * Pages redirect to login or unauthorized. Actions and API handlers use requireRole to report an error.
 */
export async function requirePageRole(roles: Role[]): Promise<Session> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!roles.includes(session.user.role)) redirect("/unauthorized")
  return session
}

/** ตรวจการล็อกอินสำหรับหน้าเว็บ และพาไปล็อกอินหากยังไม่มีเซสชัน
 * Require a session for a page and redirect to login when it is missing.
 */
export async function requirePageSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}
