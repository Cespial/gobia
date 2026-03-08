"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "default" | "sm" | "lg";
  children: ReactNode;
  href?: string;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const sizeClasses = {
  sm: "px-4 py-2 text-[0.8125rem] min-h-[36px]",
  default: "", // inherits from btn-primary / btn-secondary CSS
  lg: "px-8 py-4 text-base min-h-[56px]",
} as const;

export default function Button({
  variant = "primary",
  size = "default",
  children,
  href,
  className,
  icon,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  const classes = cn(baseClass, sizeClasses[size], className);

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
        {icon && <span className="ml-1">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      {icon && <span className="ml-1">{icon}</span>}
    </button>
  );
}
