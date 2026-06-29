import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-stone-700 bg-stone-950 px-3 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
