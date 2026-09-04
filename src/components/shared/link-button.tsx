import Link from "next/link"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

// Button (Base UI) renders a real <button> by default and warns if `render`
// points at a non-button element — this wraps that combination so callers
// don't have to remember `nativeButton={false}` every time they need a
// button-styled link.
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
