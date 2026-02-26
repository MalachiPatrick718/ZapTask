import { type ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  wide?: boolean;
}

export function SectionWrapper({
  children,
  className = "",
  id,
  wide = false,
}: SectionWrapperProps) {
  return (
    <section id={id} className={`py-24 md:py-32 px-6 ${className}`}>
      <div className={`${wide ? "max-w-7xl" : "max-w-6xl"} mx-auto`}>
        {children}
      </div>
    </section>
  );
}
