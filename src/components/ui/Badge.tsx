import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "teal" | "blue" | "gold" | "neutral";
  children: ReactNode;
  className?: string;
}

const variantClasses = {
  teal: "bg-teal-soft text-teal",
  blue: "bg-blue-soft text-blue",
  gold: "bg-gold-soft text-gold",
  neutral: "bg-warm-50 text-gray-600",
} as const;

export default function Badge({
  variant = "teal",
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
