import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/server/auth/config"

// Edge-safe: only reads/validates the session JWT, no Credentials provider
// (which needs bcrypt + Prisma) is loaded here.
const { auth } = NextAuth(authConfig)

const PUBLIC_PREFIXES = ["/login", "/unauthorized"]

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true
  return PUBLIC_PREFIXES.some((path) => pathname.startsWith(path))
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (!req.auth && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
}
