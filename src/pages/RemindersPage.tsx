import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useSearchParams } from "react-router-dom";
import { FilterBar } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { formatDate, formatRelativeDate } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowUpDown, Bell, CheckCircle2 } from "lucide-react";
import type { Reminder, RecordStatus } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileFormSteps } from "@/components/shared/MobileFormSteps";
import { cn } from "@/lib/utils";

const defaultReminder: Omit<Reminder, "id" | "createdAt"> = {
  title: "", relatedType: "general", relatedId: null, reminderDate: "",
  priority: "medium", status: "pending", message: "",
};

const statusOpts = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const priorityOpts = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const sortOpts: { value: keyof Reminder; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "relatedType", label: "Type" },
  { value: "reminderDate", label: "Date" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "message", label: "Message" },
];

export default function RemindersPage() {
  const { reminders, addReminder, updateReminder, deleteReminder, isLoading, error } = useStore();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Reminder>("reminderDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "true");
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState(defaultReminder);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data = [...reminders];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) => r.title.toLowerCase().includes(q) || r.message.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter);
    data.sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (av == null || bv == null) return 0;
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [reminders, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: keyof Reminder) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const openCreate = () => { setEditing(null); setFormData(defaultReminder); setFormOpen(true); };
  const openEdit = (r: Reminder) => { setEditing(r); setFormData(r); setFormOpen(true); };
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await updateReminder(editing.id, formData);
      else await addReminder(formData);
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async (id: string) => {
    setCompletingId(id);
    try {
      await updateReminder(id, { status: "completed" });
    } finally {
      setCompletingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteReminder(deleteId);
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const SortHeader = ({ field, children }: { field: keyof Reminder; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{children}<ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
    </TableHead>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground">{reminders.length} total records</p>
          {isLoading && <p className="text-xs text-muted-foreground mt-1">Loading…</p>}
          {!isLoading && error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" />Add Reminder</Button>
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search reminders..." statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} statusOptions={statusOpts}>
        <Select value={sortField} onValueChange={(v) => setSortField(v as keyof Reminder)}>
          <SelectTrigger className="w-[170px] rounded-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOpts.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
          <SelectTrigger className="w-[140px] rounded-full">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No reminders found" icon={<Bell className="h-8 w-8 text-muted-foreground" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Add Reminder</Button>} />
      ) : (
        <div className="rounded-3xl border bg-white overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="title">Title</SortHeader>
                <SortHeader field="relatedType">Type</SortHeader>
                <SortHeader field="reminderDate">Date</SortHeader>
                <SortHeader field="priority">Priority</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="message">Message</SortHeader>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="group">
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="capitalize">{r.relatedType}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(r.reminderDate)}</span>
                      <span className="text-xs text-muted-foreground">{formatRelativeDate(r.reminderDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{r.message}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-success"
                          onClick={() => void markComplete(r.id)}
                          title="Mark complete"
                          disabled={completingId === r.id}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Reminder" : "New Reminder"}</DialogTitle></DialogHeader>
          {isMobile ? (
            <MobileFormSteps
              primaryLabel={editing ? "Save Changes" : "Add Reminder"}
              onPrimary={() => void handleSave()}
              primaryDisabled={saving}
              isLoading={saving}
              onClose={() => setFormOpen(false)}
              steps={[
                {
                  key: "basic",
                  title: "Basic",
                  canContinue: () => !!formData.title.trim(),
                  content: (
                    <>
                      <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Related Type</Label>
                        <Select value={formData.relatedType} onValueChange={(v) => setFormData({ ...formData, relatedType: v as Reminder["relatedType"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Reminder Date</Label>
                        <Input type="date" value={formData.reminderDate} onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })} />
                      </div>
                    </>
                  ),
                },
                {
                  key: "details",
                  title: "Details",
                  content: (
                    <>
                      <div className="grid gap-2">
                        <Label>Priority</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Reminder["priority"] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{priorityOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as RecordStatus })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{statusOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Message</Label>
                        <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} />
                      </div>
                    </>
                  ),
                },
              ]}
            />
          ) : null}

          <div className={cn("grid gap-3 mt-1", isMobile && "hidden")}>
            <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Related Type</Label>
                <Select value={formData.relatedType} onValueChange={(v) => setFormData({ ...formData, relatedType: v as Reminder["relatedType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Reminder Date</Label><Input type="date" value={formData.reminderDate} onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Reminder["priority"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorityOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as RecordStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOpts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Message</Label><Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} /></div>
            <Button onClick={() => void handleSave()} className="w-full" disabled={saving}>
              {saving ? "Saving..." : (editing ? "Save Changes" : "Add Reminder")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteId(null);
        }}
        onConfirm={() => void confirmDelete()}
        isLoading={deleting}
        confirmLabel="Delete"
      />
    </div>
  );
}
