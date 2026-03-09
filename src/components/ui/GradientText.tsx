import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export default function GradientText({
  children,
  className,
}: GradientTextProps) {
  return (
    <span className={cn("italic font-serif font-bold text-ochre", className)}>
      {children}
    </span>
  );
}
