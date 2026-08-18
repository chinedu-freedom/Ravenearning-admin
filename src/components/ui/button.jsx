import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center cursor-pointer rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-[#4fb3ff]/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white hover:brightness-95 active:brightness-90 shadow-sm shadow-[#4fb3ff]/20",
        gradient: "bg-gradient-to-r from-[#4fb3ff] to-[#5ce3ff] text-white hover:brightness-95 shadow-sm shadow-[#4fb3ff]/25",
        outline:
          "border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 text-slate-700 shadow-sm",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
        ghost:
          "hover:bg-slate-100 hover:text-slate-800 text-slate-600",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500",
        link: "text-[#4fb3ff] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 text-sm",
        xs: "h-6 gap-1 rounded-md px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-md px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-sm rounded-md",
        icon: "size-9 rounded-md",
        "icon-xs":
          "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-md",
        "icon-lg": "size-11 rounded-md",
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
