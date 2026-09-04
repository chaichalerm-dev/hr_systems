import "server-only"

import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import type { Session } from "next-auth"

import { auth } from "@/server/auth"

export * from "./permissions"

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class UnauthenticatedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message)
    this.name = "UnauthenticatedError"
  }
}

/** Fetches the current session, or throws if there isn't one. Use in server actions/route handlers. */
export async function requireSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) throw new UnauthenticatedError()
  return session
}

/** Fetches the current session and asserts the user's role is in `roles`. */
export async function requireRole(roles: Role[]): Promise<Session> {
  const session = await requireSession()
  if (!roles.includes(session.user.role)) {
    throw new ForbiddenError(`This action requires one of the following roles: ${roles.join(", ")}.`)
  }
  return session
}

/**
 * Page-level counterpart to requireRole: redirects instead of throwing, so a
 * denied page shows /login or /unauthorized instead of an error boundary.
 * Use this in `page.tsx`/`layout.tsx` files; use `requireRole` in server
 * actions and route handlers, where a thrown error is the right response.
 */
export async function requirePageRole(roles: Role[]): Promise<Session> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (!roles.includes(session.user.role)) redirect("/unauthorized")
  return session
}

/** Page-level counterpart to requireSession, see requirePageRole for why. */
export async function requirePageSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}
