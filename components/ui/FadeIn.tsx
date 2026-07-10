"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.65,
  y = 28,
  x = 0,
  className,
  once = true,
}: FadeInProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Simple layout wrapper — FadeInItem children each animate independently via whileInView
export function FadeInStagger({
  children,
  stagger = 0.1,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  // stagger prop is passed to FadeInItem via React.Children if needed,
  // but by default FadeInItem fires its own whileInView animation.
  return <div className={className}>{children}</div>;
}

export function FadeInItem({
  children,
  className,
  y = 24,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
