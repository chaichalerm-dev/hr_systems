import type { Role } from "@prisma/client"
import type { DefaultSession } from "next-auth"

// `next-auth`'s own `.d.ts` only re-exports these types from "@auth/core" —
// it doesn't declare the interfaces itself — so augmentation has to target
// the module that actually declares them, or TS won't merge it in.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string
      role: Role
      employeeId: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
    employeeId: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: Role
    employeeId: string | null
  }
}
