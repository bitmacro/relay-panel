"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true);
      },
      { rootMargin: "-40px", threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const translate = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
  };
  const base = "transition-all duration-500 ease-out";
  const hidden = `opacity-0 ${translate[direction]}`;
  const shown = "opacity-100 translate-x-0 translate-y-0";

  return (
    <div
      ref={ref}
      className={`${base} ${visible ? shown : hidden} ${className}`}
      style={visible ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
