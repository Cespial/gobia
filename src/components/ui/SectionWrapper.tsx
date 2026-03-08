import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  background?: "white" | "off-white" | "navy";
  containerClass?: string;
}

const bgClasses = {
  white: "bg-background",
  "off-white": "bg-off-white",
  navy: "bg-navy text-white",
} as const;

export default function SectionWrapper({
  id,
  children,
  className,
  background = "white",
  containerClass,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-24 md:py-32", bgClasses[background], className)}>
      <div className={cn("mx-auto max-w-[1120px] px-5 md:px-8", containerClass)}>
        {children}
      </div>
    </section>
  );
}
