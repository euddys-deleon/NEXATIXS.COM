import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-background px-3.5 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/40",
          invalid ? "border-red-500" : "border-foreground/15 focus:border-brand-blue",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40"
      />
    </div>
  ),
);
Select.displayName = "Select";
