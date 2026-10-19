import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[12px] border-[1.5px] border-[var(--line)] bg-[var(--bg-alt)] px-3.5 py-2 text-base text-[var(--ink)] transition-[border-color,box-shadow,background-color] outline-none selection:bg-[rgba(235,199,0,0.35)] selection:text-[var(--ink)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--faint)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus:border-[var(--gold)] focus:bg-[var(--surf)] focus:shadow-[0_0_0_3px_rgba(235,199,0,0.22)] focus-visible:outline-none",
        "aria-invalid:border-[var(--err)] aria-invalid:focus:shadow-[0_0_0_3px_var(--err-tint)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
