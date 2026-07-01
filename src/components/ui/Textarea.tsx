import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={4}
      className={cn(
        "w-full rounded-lg border bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-foreground/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/40",
        invalid ? "border-red-500" : "border-foreground/15 focus:border-brand-blue",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
