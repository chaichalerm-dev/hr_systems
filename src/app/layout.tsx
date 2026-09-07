import type { Metadata } from "next"
import { Inter, Noto_Sans_Thai, Geist_Mono } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/shared/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/i18n/client"
import { getDictionary, getLocale } from "@/i18n/server"
import { APP_NAME } from "@/lib/constants"

// ใช้ Inter สำหรับอังกฤษ และ Noto Sans Thai สำหรับตัวอักษรไทยในข้อความเดียวกัน
// Use Inter for Latin text and Noto Sans Thai for Thai characters.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary()
  return {
    title: {
      default: `${APP_NAME} | HR Management`,
      template: `%s · ${APP_NAME}`,
    },
    description: t.app.tagline,
    openGraph: {
      title: `${APP_NAME} | HR Management`,
      description: t.app.tagline,
      type: "website",
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, dictionary] = await Promise.all([getLocale(), getDictionary()])

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dictionary={dictionary}>
          <ThemeProvider>
            <TooltipProvider delay={200}>
              {children}
              <Toaster position="top-right" richColors />
            </TooltipProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
