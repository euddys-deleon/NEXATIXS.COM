import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground placeholder:text-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/40",
        invalid ? "border-red-500" : "border-foreground/15 focus:border-brand-blue",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
