"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface TooltipContextValue {
  open: boolean
  setOpen: (next: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function TooltipProvider({
  children,
}: {
  delayDuration?: number
  children: React.ReactNode
}) {
  return <>{children}</>
}

function Tooltip({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <span data-slot="tooltip" className="relative inline-flex items-center">
        {children}
      </span>
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(TooltipContext)
  const handlers = {
    onMouseEnter: () => ctx?.setOpen(true),
    onMouseLeave: () => ctx?.setOpen(false),
    onFocus: () => ctx?.setOpen(true),
    onBlur: () => ctx?.setOpen(false),
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, handlers as Partial<unknown>)
  }

  return (
    <button
      type="button"
      data-slot="tooltip-trigger"
      {...handlers}
      {...props}
    >
      {children}
    </button>
  )
}

function TooltipContent({
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { sideOffset?: number }) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx?.open) return null

  return (
    <span
      role="tooltip"
      data-slot="tooltip-content"
      className={cn(
        "pointer-events-none absolute top-full right-0 z-50 mt-2 whitespace-nowrap rounded-lg border border-[rgba(255,255,255,0.12)] bg-[var(--coal)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--on-coal)] shadow-[0_10px_24px_rgba(10,10,16,0.28)] select-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
