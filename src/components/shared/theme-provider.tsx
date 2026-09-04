"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    // Light is the deliberate default: `enableSystem` is off so a first-time
    // visitor on a dark-mode OS still lands on the light theme, and the
    // toggle's choice is what persists from then on.
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
