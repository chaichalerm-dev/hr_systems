import type { NextAuthConfig } from "next-auth"

// ใช้ตั้งค่าเซสชันร่วมกันใน server/auth/index.ts และ proxy.ts โดยแยก Prisma กับ bcrypt ไว้ในขั้นล็อกอิน
// Share session settings with auth/index.ts and proxy.ts; load Prisma and bcrypt only for sign-in.
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    // จำการล็อกอินข้ามการปิด–เปิดเบราว์เซอร์ภายในอายุเซสชัน
    // Keep users signed in across browser restarts within the session lifetime.
    maxAge: 30 * 24 * 60 * 60, // 30 วัน / 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
        token.role = user.role
        token.employeeId = user.employeeId
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.employeeId = token.employeeId
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
