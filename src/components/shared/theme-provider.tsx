"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  return (
    // เริ่มด้วยธีมสว่าง จากนั้นใช้ธีมที่ผู้ใช้เลือกเอง แทนการเปลี่ยนตามระบบปฏิบัติการ
    // Start in light mode, then remember the user choice instead of following the OS theme.
    // next-themes เติมสคริปต์ inline ก่อน hydrate เพื่อกันจอกะพริบ ต้องส่ง nonce
    // ให้ตรงกับ Content-Security-Policy ที่ proxy.ts ตั้งไว้ ไม่งั้นจะถูกบล็อก
    // next-themes injects an inline script before hydration to avoid a theme
    // flash; it needs the same nonce as the CSP set in proxy.ts or it's blocked.
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      nonce={nonce}
    >
      {children}
    </NextThemesProvider>
  )
}
