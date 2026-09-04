import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"

const logoSizes = {
  sm: {
    mark: "size-7 rounded-[0.6rem]",
    wordmark: "text-base",
  },
  md: {
    mark: "size-9 rounded-xl",
    wordmark: "text-lg",
  },
  lg: {
    mark: "size-11 rounded-[0.9rem]",
    wordmark: "text-xl",
  },
} as const

export function BrandMark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="36" height="36" rx="11" fill="#2A78D6" />
      <path
        d="M0 25.5C7.5 20.5 13.5 28.5 21.5 23.5C27.2 19.9 31.9 20.7 36 23V36H0V25.5Z"
        fill="#1362BF"
      />
      <path
        d="M11.25 16.5V25.5M24.75 16.5V25.5M11.25 21H24.75"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11.25" cy="10.5" r="3" fill="white" />
      <circle cx="24.75" cy="10.5" r="3" fill="#FBBF24" />
    </svg>
  )
}

export function Logo({
  className,
  iconOnly = false,
  size = "md",
  ...props
}: ComponentProps<"div"> & {
  iconOnly?: boolean
  size?: keyof typeof logoSizes
}) {
  const styles = logoSizes[size]

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={iconOnly ? APP_NAME : props["aria-label"]}
      role={iconOnly ? "img" : props.role}
      {...props}
    >
      <span
        className={cn(
          "flex shrink-0 overflow-hidden shadow-[0_6px_18px_-8px_rgba(42,120,214,0.9)] ring-1 ring-primary/15",
          styles.mark
        )}
      >
        <BrandMark className="size-full" />
      </span>
      {!iconOnly && (
        <span
          className={cn("inline-flex items-baseline tracking-[-0.035em]", styles.wordmark)}
          aria-label={APP_NAME}
        >
          <span className="font-extrabold text-foreground" aria-hidden="true">
            HR
          </span>
          <span className="font-semibold text-primary" aria-hidden="true">
            Flow
          </span>
        </span>
      )}
    </div>
  )
}
