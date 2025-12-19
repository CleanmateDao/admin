import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  children,
  size = "md",
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <DialogPrimitive.Content
          className={clsx(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-50 p-6 border",
            "bg-card text-card-foreground",
            {
              "w-full max-w-sm": size === "sm",
              "w-full max-w-md": size === "md",
              "w-full max-w-2xl": size === "lg",
            }
          )}
          style={{
            borderColor: "hsl(var(--border))",
          }}
        >
          <DialogPrimitive.Title className="text-xl font-semibold mb-4 text-foreground">
            {title}
          </DialogPrimitive.Title>
          {children}
          <DialogPrimitive.Close className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            ×
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
