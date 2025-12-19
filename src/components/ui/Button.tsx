import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "px-2 py-1 text-xs": size === "sm",
          "px-4 py-2 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
          "bg-primary text-primary-foreground hover:bg-primary/90":
            variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80":
            variant === "secondary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90":
            variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
