import type { NextAuthConfig } from "next-auth"

// Edge-safe subset of the NextAuth config: no providers here, since the
// Credentials provider needs bcrypt + Prisma (Node.js runtime only). This
// file is imported by both `auth.ts` (full config, Node runtime) and
// `middleware.ts` (edge runtime, only needs to read/validate the JWT).
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    // Keep users signed in across browser restarts instead of the
    // session expiring the moment the tab/browser closes.
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
