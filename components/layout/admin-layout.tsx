"use client";

import * as React from "react";
import { AppSidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

function AdminLayoutComponent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { loading, error } = useAuth();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />

      {/* Main wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* TOP NAV MUST BE OUTSIDE SidebarInset */}
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />

        {/* Now wrap only content inside SidebarInset */}
        <SidebarInset>
          <main className="flex-1 p-4 overflow-auto min-w-0">
            {loading ? (
              <Card>
                <CardContent className="py-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2 p-6">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    Loading...
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-6 text-sm text-red-600">
                  {error}
                </CardContent>
              </Card>
            ) : (
              children
            )}
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}

export const AdminLayout = React.memo(AdminLayoutComponent);
