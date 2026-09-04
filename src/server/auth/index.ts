import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/db/client"
import { authConfig } from "./config"

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: { employee: { select: { id: true } } },
        })

        if (!user || !user.isActive) return null

        const passwordMatches = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatches) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employee?.id ?? null,
        }
      },
    }),
  ],
})
