"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedContent({
  children,
  distance = 20,
  duration = 550,
  delay = 0,
  className,
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transform: visible ? "translateY(0px)" : `translateY(${distance}px)`,
      }}
      className={cn(
        "transition-all ease-out will-change-[transform,opacity]",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
