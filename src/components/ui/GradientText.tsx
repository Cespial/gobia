import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: "teal" | "blue" | "gold";
}

const variantClasses = {
  teal: "text-teal",
  blue: "text-blue",
  gold: "text-gold",
} as const;

export default function GradientText({
  children,
  className,
  variant = "teal",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "italic font-serif",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
