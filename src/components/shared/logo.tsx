import type { ComponentProps } from "react"
import { Workflow } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"

export function Logo({
  className,
  iconOnly = false,
  ...props
}: ComponentProps<"div"> & { iconOnly?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)} {...props}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Workflow className="size-4" aria-hidden />
      </span>
      {!iconOnly && <span className="text-base tracking-tight">{APP_NAME}</span>}
    </div>
  )
}
