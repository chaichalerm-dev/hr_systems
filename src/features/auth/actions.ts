"use server"

import { AuthError } from "next-auth"

import { signIn, signOut } from "@/server/auth"
import { loginSchema } from "@/validations/auth"

/**
 * Errors are returned as codes rather than sentences so the client can render
 * them in the viewer's language, a server action has no access to the
 * locale-aware dictionary the client already holds.
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
    // NEXT_REDIRECT and other framework-internal signals must propagate.
    throw error
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}
