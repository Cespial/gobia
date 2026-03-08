import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "ochre" | "ink" | "neutral";
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  ochre: "bg-ochre-soft text-ochre",
  ink: "bg-gray-100 text-ink",
  neutral: "bg-cream text-gray-600",
} as const;

export default function Badge({
  variant = "ochre",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
