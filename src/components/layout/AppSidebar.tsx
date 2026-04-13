import { LayoutDashboard, Package, CreditCard, Building2, Bell, Settings, Menu, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { isUpcoming, isOverdue } from "@/utils/date";
import { NotificationCenter } from "@/components/shared/NotificationCenter";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
  { title: "Rent Records", url: "/rent", icon: Building2 },
  { title: "Reminders", url: "/reminders", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { reminders, subscriptions, rentRecords } = useStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const alertCount =
    reminders.filter((r) => r.status === "pending" && isUpcoming(r.reminderDate, 7)).length +
    subscriptions.filter((s) => s.status === "active" && isUpcoming(s.renewalDate, 30)).length +
    rentRecords.filter((r) => isOverdue(r.dueDate) && r.status !== "completed").length;

  return (
    <aside className={cn(
      "fixed inset-y-3 left-3 z-40 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar shadow-sm transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <button onClick={onToggle} className="text-sidebar-foreground hover:text-sidebar-primary transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        {!collapsed && (
          <span className="ml-3 text-lg font-bold text-sidebar-foreground tracking-tight">
            wegomanage
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
              "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
            activeClassName="rounded-full bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button
          onClick={() => setNotifOpen(true)}
          className={cn(
            "relative flex items-center gap-3 rounded-full px-3 py-2.5 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full",
            collapsed && "justify-center px-0"
          )}
        >
          <Bell className="h-5 w-5" />
          {!collapsed && <span>Notifications</span>}
          {alertCount > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {alertCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className={cn(
            "flex items-center gap-3 rounded-full px-3 py-2.5 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
      <NotificationCenter open={notifOpen} onOpenChange={setNotifOpen} />
    </aside>
  );
}
