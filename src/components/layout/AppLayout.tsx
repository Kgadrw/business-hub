import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const content = children ?? <Outlet />;

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("transition-all duration-300", collapsed ? "ml-24" : "ml-64")}>
        <main className="p-6">{content}</main>
      </div>
    </div>
  );
}
