import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors",
        "bg-background text-foreground",
        "border-input focus:ring-ring focus:border-ring",
        className
      )}
      {...props}
    />
  );
}
