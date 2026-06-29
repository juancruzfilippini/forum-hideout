import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-32 w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
