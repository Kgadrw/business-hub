import { LayoutDashboard, Package, CreditCard, Building2, Bell, Menu, Moon, Sun } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
  { title: "Rent Records", url: "/rent", icon: Building2 },
  { title: "Reminders", url: "/reminders", icon: Bell },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <button onClick={onToggle} className="text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        {!collapsed && (
          <span className="ml-3 text-lg font-bold text-sidebar-foreground tracking-tight">
            Ops<span className="text-sidebar-primary">Base</span>
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setDark(!dark)}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-muted hover:text-sidebar-foreground transition-colors w-full",
            collapsed && "justify-center px-0"
          )}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}
