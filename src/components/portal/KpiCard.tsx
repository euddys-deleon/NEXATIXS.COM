"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <Card className="bg-background">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/60">{label}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
            <Icon size={18} />
          </span>
        </div>
        <p className="mt-3 font-heading text-3xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-foreground/60">{hint}</p>}
      </Card>
    </motion.div>
  );
}
