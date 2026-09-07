"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { LOCALE_COOKIE, isLocale } from "./config"

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
    sameSite: "lax",
  })

  // โหลดข้อความของทุกหน้าใหม่เมื่อเปลี่ยนภาษา
  // Refresh the page tree so all text uses the newly selected language.
  revalidatePath("/", "layout")
}
