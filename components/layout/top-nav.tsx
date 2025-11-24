"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar as SidebarInner } from "./sidebar";

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex justify-around h-14 items-center border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
      <div className="mr-2 flex items-center lg:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-3">
              <SidebarInner collapsed={false} onToggle={() => {}} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <button
        type="button"
        onClick={onToggleSidebar}
        className="mr-3 hidden h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 lg:flex"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center justify-around ">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>{user?.name?.[0] ?? "A"}</Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
