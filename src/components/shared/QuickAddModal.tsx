import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, Building2, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { label: "New Product", icon: Package, path: "/products", color: "text-info" },
  { label: "New Subscription", icon: CreditCard, path: "/subscriptions", color: "text-success" },
  { label: "New Rent Record", icon: Building2, path: "/rent", color: "text-warning" },
  { label: "New Reminder", icon: Bell, path: "/reminders", color: "text-primary" },
];

export function QuickAddModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto flex-col gap-2 py-6"
              onClick={() => { onOpenChange(false); navigate(action.path + "?new=true"); }}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
