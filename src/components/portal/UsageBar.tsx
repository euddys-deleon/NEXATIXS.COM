"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function UsageBar({
  icon,
  name,
  category,
  percent,
}: {
  icon: ReactNode;
  name: string;
  category?: string | null;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          {icon}
          {name}
          {category && <span className="text-foreground/60">— {category}</span>}
        </span>
        <span className="font-semibold text-foreground/70">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-brand-blue"
        />
      </div>
    </div>
  );
}
