import Link from "next/link"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

// รวมการตั้งค่าลิงก์ที่หน้าตาเหมือนปุ่มไว้ที่เดียว โดยบอก Base UI ว่าไม่ได้ใช้แท็ก button
// Set nativeButton=false here so callers can use a button-styled link.
export function LinkButton({
  href,
  children,
  ...props
}: { href: string } & Omit<ComponentProps<typeof Button>, "render" | "nativeButton">) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props}>
      {children}
    </Button>
  )
}
