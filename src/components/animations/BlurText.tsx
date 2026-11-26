"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  animateBy?: "words" | "letters";
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function BlurText({
  text,
  className,
  delay = 55,
  animateBy = "words",
  as: Component = "span",
}: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const segments = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <Component
      ref={ref as React.RefObject<never>}
      className={cn("inline-flex flex-wrap", className)}
    >
      {segments.map((segment, index) => (
        <span
          key={`${segment}-${index}`}
          style={{
            transitionDelay: `${index * delay}ms`,
          }}
          className={cn(
            "inline-block transition-all duration-700 ease-out will-change-[transform,opacity,filter]",
            inView
              ? "translate-y-0 opacity-100 blur-0"
              : "translate-y-3 opacity-0 blur-[8px]"
          )}
        >
          {segment}
          {animateBy === "words" && index < segments.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Component>
  );
}
