"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"

const SHOW_AFTER_PX = 480

// ปุ่มลอยเป็นสัญลักษณ์ล้วน ไม่ใช้ข้อความ เพื่อให้กดกลับขึ้นบนได้ทันทีจากทุกจุดของหน้า
// ไม่ต้องเลื่อนไปหา footer เหมือนลิงก์ข้อความแบบเดิม
// An icon-only floating button so jumping back to the top works from
// anywhere on the page, instead of scrolling all the way to the footer link.
export function BackToTopButton({ label }: { label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <Button
      type="button"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      tabIndex={visible ? 0 : -1}
      // ปุ่มลอยติดขอบจอแบบนี้มักโดนส่วนขยายเบราว์เซอร์ (dark mode, accessibility
      // widget ฯลฯ) แก้ style ก่อน React hydrate เสร็จ ทำให้ขึ้นเตือน hydration
      // mismatch ทั้งที่ไม่กระทบการทำงานจริง จึงปิดเตือนเฉพาะจุดนี้
      // Fixed, edge-anchored buttons like this are common targets for browser
      // extensions (dark mode, accessibility widgets) that tweak styles before
      // React hydrates, triggering a harmless hydration-mismatch warning here.
      suppressHydrationWarning
      className={`fixed right-5 bottom-5 z-40 size-12 rounded-full shadow-lg shadow-primary/25 transition-all duration-300 sm:right-8 sm:bottom-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="size-5" />
    </Button>
  )
}
