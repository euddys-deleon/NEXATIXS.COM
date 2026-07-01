import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "mt-0.5 h-4 w-4 shrink-0 rounded border-foreground/30 text-brand-blue accent-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/40",
        invalid && "border-red-500",
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = "Checkbox";
