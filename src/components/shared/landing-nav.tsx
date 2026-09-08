"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface NavItem {
  href: string
  label: string
}

// ไฮไลต์ลิงก์ตาม section ที่กำลังเลื่อนผ่านอยู่ ใช้ IntersectionObserver แทนการ
// ฟัง scroll event ตรงๆ เพื่อไม่ให้คำนวณตำแหน่งทุกเฟรมจนหน่วง
// Highlights the link for whichever section is currently in view, using
// IntersectionObserver instead of a raw scroll listener so it doesn't
// recompute positions on every frame.
export function LandingNav({ items, ariaLabel }: { items: NavItem[]; ariaLabel: string }) {
  const [activeHref, setActiveHref] = useState<string | null>(null)

  useEffect(() => {
    const sections = items
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => el !== null)
    if (sections.length === 0) return

    // ถือว่า section "active" ตอนมันอยู่แถบกลางจอ ไม่ใช่ทันทีที่ขอบบนโผล่มา
    // A section counts as "active" once it reaches the middle band of the
    // viewport, not the instant its top edge appears.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`)
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav aria-label={ariaLabel} className="order-last mt-4 hidden w-full items-center justify-center gap-6 border-t pt-3 text-sm lg:order-none lg:mt-0 lg:flex lg:w-auto lg:border-0 lg:pt-0">
      {items.map((item) => {
        const isActive = activeHref === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-md border-b-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
