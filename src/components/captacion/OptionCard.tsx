"use client";

import { motion } from "framer-motion";

export function OptionCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-full flex-col rounded-2xl border border-foreground/10 bg-background-subtle p-6 text-left transition-colors hover:border-brand-blue/40"
    >
      <span className="font-heading text-lg font-semibold text-foreground">{title}</span>
      <span className="mt-2 text-sm text-foreground/60">{description}</span>
    </motion.button>
  );
}
