"use server"

import { AuthError } from "next-auth"

import { signIn, signOut } from "@/server/auth"
import { loginSchema } from "@/validations/auth"

/** ส่งรหัสข้อผิดพลาดกลับไป แล้วให้หน้าจอเลือกข้อความตามภาษาของผู้ใช้
 * Return an error code so the screen can display the message in the selected language.
 */
export type LoginErrorCode = "invalidInput" | "invalidCredentials"

export interface LoginActionState {
  error: LoginErrorCode | null
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "invalidInput" }
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard"

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    })
    return { error: null }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "invalidCredentials" }
    }
    // ส่งสัญญาณควบคุมของ Next.js ต่อไป เพื่อให้การเปลี่ยนหน้าทำงานได้
    // Let Next.js control signals, including redirects, reach the framework.
    throw error
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}
