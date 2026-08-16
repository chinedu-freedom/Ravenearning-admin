import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center cursor-pointer rounded-xl border border-transparent bg-clip-padding text-xs font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#4f8cff] to-[#3b82f6] text-white hover:from-[#3b82f6] hover:to-[#2563eb] shadow-sm shadow-[#4f8cff]/20",
        gradient: "bg-gradient-to-r from-[#4f8cff] to-[#6ee7ff] text-white hover:opacity-95 shadow-sm shadow-[#4f8cff]/25",
        outline:
          "border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 text-slate-700 shadow-sm",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
        ghost:
          "hover:bg-slate-100 hover:text-slate-800 text-slate-600",
        destructive:
          "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:border-red-400",
        link: "text-[#4f8cff] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 text-xs",
        xs: "h-6 gap-1 rounded-lg px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-lg px-3 text-[11.5px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-sm rounded-xl",
        icon: "size-9 rounded-xl",
        "icon-xs":
          "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-lg",
        "icon-lg": "size-11 rounded-xl",
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
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
