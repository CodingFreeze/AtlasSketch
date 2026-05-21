import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

const variantClasses = {
  primary:
    "border-atlas-lime bg-atlas-lime text-atlas-black hover:bg-atlas-lime/90 active:bg-atlas-lime/80",
  secondary:
    "border-atlas-line bg-atlas-panel text-atlas-paper hover:border-atlas-cyan hover:text-atlas-cyan active:bg-atlas-cyan/10",
  danger:
    "border-atlas-red bg-atlas-red/10 text-atlas-red hover:bg-atlas-red/20 active:bg-atlas-red/25",
  ghost:
    "border-transparent bg-transparent text-atlas-muted hover:border-atlas-line hover:text-atlas-paper active:bg-atlas-panel"
} as const;

const sizeClasses = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2.5 px-5 text-sm",
  icon: "size-9 justify-center p-0"
} as const;

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: string;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
};

type ButtonProps =
  | (ButtonBaseProps & {
      children: ReactNode;
      iconOnly?: false;
    })
  | (ButtonBaseProps & {
      "aria-label": string;
      children?: ReactNode;
      iconOnly: true;
    });

export function Button({
  className,
  variant = "secondary",
  size = "md",
  type = "button",
  iconOnly,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded border font-mono font-medium uppercase tracking-[0.12em] transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atlas-cyan",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-atlas-line disabled:bg-atlas-panel/60 disabled:text-atlas-muted/60",
        variantClasses[variant],
        sizeClasses[iconOnly ? "icon" : size],
        className
      )}
      type={type}
      {...props}
    />
  );
}
