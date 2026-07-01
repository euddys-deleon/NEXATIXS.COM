import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("py-16 sm:py-24", {
  variants: {
    tone: {
      default: "bg-background",
      subtle: "bg-background-subtle",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export function Section({ className, tone, ...props }: SectionProps) {
  return <section className={cn(sectionVariants({ tone }), className)} {...props} />;
}
