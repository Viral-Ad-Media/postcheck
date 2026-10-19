import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full items-center gap-3.5 rounded-[14px] border px-5 py-4 text-sm transition-[background-color,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(214,181,0,0.45)] bg-[var(--gold-wash)] text-[var(--ink)]",
        success:
          "border-[var(--conv-line)] bg-[var(--conv-bg)] text-[var(--ink)]",
        destructive:
          "border-[rgba(198,42,32,0.28)] bg-[var(--err-tint)] text-[var(--err)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"strong">) {
  return (
    <strong
      data-slot="alert-title"
      className={cn(
        "block text-[13px] leading-snug font-semibold tracking-[-0.01em] text-[var(--ink)]",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-description"
      className={cn(
        "mt-1 text-xs leading-relaxed text-[var(--muted)] [text-wrap:pretty]",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
