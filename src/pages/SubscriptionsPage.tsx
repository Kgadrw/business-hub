import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useSearchParams } from "react-router-dom";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { formatDate, formatRelativeDate, isExpiringSoon } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowUpDown, CreditCard } from "lucide-react";
import type { Subscription, RecordStatus } from "@/types";

const defaultSub: Omit<Subscription, "id" | "createdAt"> = {
  name: "", provider: "", planType: "", amount: 0, billingCycle: "monthly",
  startDate: "", renewalDate: "", paymentMethod: "", status: "active",
  reminderDaysBefore: 7, notes: "",
};

const statusOpts = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

export default function SubscriptionsPage() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useStore();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Subscription>("renewalDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "true");
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState(defaultSub);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...subscriptions];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((s) => s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") data = data.filter((s) => s.status === statusFilter);
    data.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [subscriptions, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: keyof Subscription) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const openCreate = () => { setEditing(null); setFormData(defaultSub); setFormOpen(true); };
  const openEdit = (s: Subscription) => { setEditing(s); setFormData(s); setFormOpen(true); };
  const handleSave = () => {
    if (editing) updateSubscription(editing.id, formData);
    else addSubscription(formData);
    setFormOpen(false);
  };

  const SortHeader = ({ field, children }: { field: keyof Subscription; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{children}<ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
    </TableHead>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">{subscriptions.length} total records</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" />Add Subscription</Button>
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search subscriptions..." statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} statusOptions={statusOpts} />

      {filtered.length === 0 ? (
        <EmptyState title="No subscriptions found" icon={<CreditCard className="h-8 w-8 text-muted-foreground" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Add Subscription</Button>} />
      ) : (
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="name">Name</SortHeader>
                <SortHeader field="provider">Provider</SortHeader>
                <SortHeader field="amount">Amount</SortHeader>
                <TableHead>Cycle</TableHead>
                <SortHeader field="renewalDate">Renewal</SortHeader>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="group">
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.provider}</TableCell>
                  <TableCell>${s.amount.toLocaleString()}</TableCell>
                  <TableCell className="capitalize">{s.billingCycle}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(s.renewalDate)}</span>
                      {isExpiringSoon(s.renewalDate, 30) && <span className="text-xs text-warning">{formatRelativeDate(s.renewalDate)}</span>}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Subscription" : "New Subscription"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>Provider</Label><Input value={formData.provider} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Amount ($)</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} /></div>
              <div><Label>Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(v) => setFormData({ ...formData, billingCycle: v as Subscription["billingCycle"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Plan Type</Label><Input value={formData.planType} onChange={(e) => setFormData({ ...formData, planType: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              <div><Label>Renewal Date</Label><Input type="date" value={formData.renewalDate} onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Payment Method</Label><Input value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} /></div>
              <div><Label>Remind (days before)</Label><Input type="number" value={formData.reminderDaysBefore} onChange={(e) => setFormData({ ...formData, reminderDaysBefore: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as RecordStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Save Changes" : "Add Subscription"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { deleteSubscription(deleteId!); setDeleteId(null); }} />
    </div>
  );
}
