"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children
}: {
  children: React.ReactNode;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuTrigger must be used within menu");
  return (
    <button type="button" onClick={() => ctx.setOpen(!ctx.open)}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div
      className={cn(
        "absolute right-0 mt-2 w-44 rounded-md border border-slate-200 bg-white py-1 shadow-lg z-50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
