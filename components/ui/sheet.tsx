"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(true)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm lg:hidden"
    >
      {children}
    </button>
  );
}

export function SheetContent({
  children,
  side = "left"
}: {
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");
  const { open, setOpen } = ctx;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex lg:hidden"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className={cn(
          "relative h-full w-72 bg-white shadow-xl",
          side === "left" ? "ml-0" : "ml-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-4 py-3">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-slate-900">{children}</h2>;
}
