import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "card",
        !hover && "hover:transform-none hover:shadow-none hover:border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
