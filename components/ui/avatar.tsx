import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white",
        className
      )}
      {...props}
    />
  );
}
