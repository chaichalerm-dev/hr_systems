"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    // เริ่มด้วยธีมสว่าง จากนั้นใช้ธีมที่ผู้ใช้เลือกเอง แทนการเปลี่ยนตามระบบปฏิบัติการ
    // Start in light mode, then remember the user choice instead of following the OS theme.
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
