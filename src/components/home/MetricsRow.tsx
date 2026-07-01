"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion, animate } from "framer-motion";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

const metrics = [
  { value: 10, suffix: "+", labelKey: "clientsLabel" },
  { value: 6, suffix: "+", labelKey: "projectsLabel" },
  { value: 3, suffix: "", labelKey: "engineersLabel" },
  { value: 4, suffix: "x", labelKey: "growthLabel" },
] as const;

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
      {display}
      {suffix}
    </span>
  );
}

export function MetricsRow() {
  const t = useTranslations("Home.metrics");

  return (
    <section className="border-y border-foreground/10 bg-background-subtle">
      <Container className="grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.labelKey}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="text-center"
          >
            <Counter value={metric.value} suffix={metric.suffix} />
            <p className="mt-2 text-sm text-foreground/60">{t(metric.labelKey)}</p>
          </motion.div>
        ))}
      </Container>
    </section>
  );
}
