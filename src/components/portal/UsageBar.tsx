"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function UsageBar({
  icon: Icon,
  name,
  category,
  percent,
}: {
  icon: LucideIcon;
  name: string;
  category?: string | null;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <Icon size={16} className="text-brand-blue" />
          {name}
          {category && <span className="text-foreground/40">— {category}</span>}
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
