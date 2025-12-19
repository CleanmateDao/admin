import type { ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { clsx } from "clsx";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onValueChange,
  children,
  placeholder,
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={clsx(
          "px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors flex items-center justify-between",
          "bg-background text-foreground border-input focus:ring-ring focus:border-ring",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="ml-2">▼</SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="rounded-md shadow-lg z-50 min-w-[var(--radix-select-trigger-width)] border"
          style={{
            backgroundColor: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="px-3 py-2 rounded cursor-pointer focus:bg-secondary focus:outline-none transition-colors text-foreground hover:bg-secondary/50"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
