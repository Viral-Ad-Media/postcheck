import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap select-none tabular-nums transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] [&>svg]:size-3.5 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-[var(--gold-line)] bg-[image:var(--grad-sel)] text-[var(--ink-on-gold)]",
        gold:
          "border-[rgba(214,181,0,0.5)] bg-[var(--gold-wash)] text-[var(--link)]",
        secondary:
          "border-[var(--line)] bg-[var(--bg-alt)] text-[var(--faint)]",
        success:
          "border-[rgba(14,122,67,0.35)] bg-[var(--ok-tint)] text-[var(--accent)]",
        destructive:
          "border-[rgba(198,42,32,0.35)] bg-[var(--err-tint)] text-[var(--err)]",
        outline:
          "border-[var(--line)] bg-transparent text-[var(--muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const mergedClassName = cn(badgeVariants({ variant }), className)

  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      ...props,
      className: cn(mergedClassName, children.props.className),
    } as Partial<{ className?: string }>)
  }

  return (
    <span
      data-slot="badge"
      className={mergedClassName}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
