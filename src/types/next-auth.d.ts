import type { Role } from "@prisma/client"
import type { DefaultSession } from "next-auth"

// ขยายชนิดข้อมูลที่ @auth/core ซึ่งเป็นผู้ประกาศจริง เพื่อให้ TypeScript รวมฟิลด์ที่เพิ่มได้
// Extend the interfaces in @auth/core, where they are declared, so TypeScript merges the added fields.
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
