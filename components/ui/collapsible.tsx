"use client"

import * as React from "react"

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (next: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (next: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isOpen = open !== undefined ? open : internalOpen
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [open, onOpenChange]
  )

  return (
    <CollapsibleContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      <div
        data-slot="collapsible"
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(CollapsibleContext)
  const isOpen = Boolean(ctx?.open)

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      data-slot="collapsible-trigger"
      data-state={isOpen ? "open" : "closed"}
      onClick={(e) => {
        ctx?.onOpenChange(!isOpen)
        onClick?.(e)
      }}
      {...props}
    />
  )
}

function CollapsibleContent({
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx?.open) return null

  return (
    <div
      data-slot="collapsible-content"
      data-state="open"
      {...props}
    >
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
