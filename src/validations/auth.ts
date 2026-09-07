import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("กรอกอีเมลให้ถูกต้อง / Enter a valid email address."),
  password: z.string().min(1, "กรอกรหัสผ่าน / Enter your password."),
})

export type LoginInput = z.infer<typeof loginSchema>
