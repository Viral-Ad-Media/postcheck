import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap select-none transition-[transform,filter,box-shadow,background-color,border-color,color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:outline-[3px] focus-visible:outline-[var(--gold)] focus-visible:outline-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[image:var(--grad-btn)] text-[var(--ink-on-gold)] shadow-[0_2px_6px_rgba(235,199,0,0.22)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(235,199,0,0.38)] active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-[1.5px] border-[var(--line)] bg-transparent text-[var(--ink)] hover:bg-[image:var(--grad-sel)] hover:border-[var(--gold-line)] hover:text-[var(--ink-on-gold)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-[var(--bg-alt)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--gold-line)]",
        ghost:
          "hover:bg-[var(--bg-alt)] hover:text-[var(--ink)]",
        link: "text-[var(--link)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-full px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-full px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-full px-7 has-[>svg]:px-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const mergedClassName = cn(buttonVariants({ variant, size, className }))

  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      ...props,
      className: cn(mergedClassName, children.props.className),
    } as Partial<{ className?: string }>)
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button, buttonVariants }
