import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authConfig } from "@/server/auth/config"

// อ่านและตรวจเซสชันเท่านั้น การตรวจรหัสผ่านที่ใช้ Prisma กับ bcrypt อยู่ฝั่ง Node.js
// Only read the session here. Password checks using Prisma and bcrypt run in Node.js.
const { auth } = NextAuth(authConfig)

const PUBLIC_PREFIXES = ["/login", "/unauthorized"]

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true
  return PUBLIC_PREFIXES.some((path) => pathname.startsWith(path))
}

// สุ่มค่า nonce ใหม่ทุกคำขอ แล้วใส่ใน CSP เพื่อให้ script ที่ Next.js
// สร้างเองผ่านได้ โดยไม่ต้องเปิด 'unsafe-inline' ให้ script ทั่วไป
// A fresh nonce per request lets Next.js's own inline scripts satisfy a
// strict CSP without allowing 'unsafe-inline' for scripts in general.
function buildCsp(nonce: string): string {
  // React/Next.js dev mode (Fast Refresh, stack traces) ต้องใช้ eval() แต่ build
  // จริงไม่ใช้ จึงเปิด unsafe-eval เฉพาะตอน dev เพื่อไม่ให้ production หลวมโดยไม่จำเป็น
  // React/Next.js dev mode (Fast Refresh, stack traces) needs eval(); production
  // builds don't, so unsafe-eval is only added in dev to keep prod strict.
  const scriptSrc = process.env.NODE_ENV === "production"
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`

  const directives = [
    `default-src 'self'`,
    scriptSrc,
    // ปุ่มกราฟ (chart.tsx) วาง <style> inline แบบไดนามิกตามสี ต้องใช้ unsafe-inline
    // The chart component renders a dynamic inline <style> tag, so style-src needs unsafe-inline.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ]

  // บังคับอัปเกรดเป็น HTTPS อัตโนมัติ เหมาะกับ production (Vercel) เท่านั้น
  // เพราะ dev server เป็น HTTP ล้วน ถ้าเปิดไว้ตอน dev เบราว์เซอร์จะพยายามต่อ
  // https://localhost แล้วพังด้วย ERR_SSL_PROTOCOL_ERROR ทุกครั้งที่ fetch/navigate
  // Only auto-upgrade to HTTPS in production (Vercel is HTTPS). The dev
  // server is plain HTTP, so leaving this on there makes the browser try
  // https://localhost and fail with ERR_SSL_PROTOCOL_ERROR on every fetch/navigation.
  if (process.env.NODE_ENV === "production") {
    directives.push(`upgrade-insecure-requests`)
  }

  return directives.join("; ")
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const nonce = crypto.randomUUID().replace(/-/g, "")
  const csp = buildCsp(nonce)

  function withCsp(response: NextResponse): NextResponse {
    response.headers.set("Content-Security-Policy", csp)
    return response
  }

  if (!req.auth && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withCsp(NextResponse.redirect(loginUrl))
  }

  if (req.auth && pathname === "/login") {
    return withCsp(NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin)))
  }

  // ส่ง nonce ต่อผ่าน request header ด้วย เพื่อให้ Server Component (เช่น
  // ThemeProvider) อ่านค่าเดียวกันไปใส่ในสคริปต์ที่ตัวเองสร้างได้
  // Also forward the nonce via a request header so Server Components (like
  // ThemeProvider) can read the same value for scripts they render.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-nonce", nonce)

  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }))
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
}
