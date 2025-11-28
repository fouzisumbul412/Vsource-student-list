"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  UserPlus,
  ListChecks,
  CreditCard,
  FileText,
  Users,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Student Registration",
    href: "/student-registration",
    icon: UserPlus,
  },
  {
    label: "Student Registration List",
    href: "/student-registration-list",
    icon: ListChecks,
  },
  { label: "Make Payment", href: "/make-payment", icon: CreditCard },
  { label: "Transactions List", href: "/transactions", icon: FileText },
  { label: "Sub Admin Form", href: "/sub-admin", icon: Users },
  { label: "Employee Logins", href: "/employee-logins", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo Section */}

        <div className="flex items-center px-4 py-4">
          <Logo />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent",
                          active && "bg-primary/10 text-primary font-semibold"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500">
        © {new Date().getFullYear()} VSource Education
      </SidebarFooter>
    </Sidebar>
  );
}
