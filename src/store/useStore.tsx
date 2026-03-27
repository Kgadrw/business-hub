import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product, Subscription, RentRecord, Reminder, ActivityLog } from "@/types";
import { seedProducts, seedSubscriptions, seedRentRecords, seedReminders, seedActivityLog } from "@/data/seed";

interface StoreContextType {
  products: Product[];
  subscriptions: Subscription[];
  rentRecords: RentRecord[];
  reminders: Reminder[];
  activityLog: ActivityLog[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSubscription: (s: Omit<Subscription, "id" | "createdAt">) => void;
  updateSubscription: (id: string, s: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  addRentRecord: (r: Omit<RentRecord, "id" | "createdAt">) => void;
  updateRentRecord: (id: string, r: Partial<RentRecord>) => void;
  deleteRentRecord: (id: string) => void;
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (id: string, r: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

let idCounter = 100;
const genId = () => `gen_${++idCounter}`;
const now = () => new Date().toISOString().split("T")[0];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(seedSubscriptions);
  const [rentRecords, setRentRecords] = useState<RentRecord[]>(seedRentRecords);
  const [reminders, setReminders] = useState<Reminder[]>(seedReminders);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(seedActivityLog);

  const logActivity = useCallback((action: string, recordType: string, recordName: string) => {
    setActivityLog((prev) => [
      { id: genId(), action, recordType, recordName, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id" | "createdAt">) => {
    const product = { ...p, id: genId(), createdAt: now() };
    setProducts((prev) => [product, ...prev]);
    logActivity("created", "product", p.name);
  }, [logActivity]);

  const updateProduct = useCallback((id: string, p: Partial<Product>) => {
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
    logActivity("updated", "product", p.name || "Product");
  }, [logActivity]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) logActivity("deleted", "product", item.name);
      return prev.filter((x) => x.id !== id);
    });
  }, [logActivity]);

  const addSubscription = useCallback((s: Omit<Subscription, "id" | "createdAt">) => {
    setSubscriptions((prev) => [{ ...s, id: genId(), createdAt: now() }, ...prev]);
    logActivity("created", "subscription", s.name);
  }, [logActivity]);

  const updateSubscription = useCallback((id: string, s: Partial<Subscription>) => {
    setSubscriptions((prev) => prev.map((x) => (x.id === id ? { ...x, ...s } : x)));
    logActivity("updated", "subscription", s.name || "Subscription");
  }, [logActivity]);

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) logActivity("deleted", "subscription", item.name);
      return prev.filter((x) => x.id !== id);
    });
  }, [logActivity]);

  const addRentRecord = useCallback((r: Omit<RentRecord, "id" | "createdAt">) => {
    setRentRecords((prev) => [{ ...r, id: genId(), createdAt: now() }, ...prev]);
    logActivity("created", "rent", r.title);
  }, [logActivity]);

  const updateRentRecord = useCallback((id: string, r: Partial<RentRecord>) => {
    setRentRecords((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)));
    logActivity("updated", "rent", r.title || "Rent Record");
  }, [logActivity]);

  const deleteRentRecord = useCallback((id: string) => {
    setRentRecords((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) logActivity("deleted", "rent", item.title);
      return prev.filter((x) => x.id !== id);
    });
  }, [logActivity]);

  const addReminder = useCallback((r: Omit<Reminder, "id" | "createdAt">) => {
    setReminders((prev) => [{ ...r, id: genId(), createdAt: now() }, ...prev]);
    logActivity("created", "reminder", r.title);
  }, [logActivity]);

  const updateReminder = useCallback((id: string, r: Partial<Reminder>) => {
    setReminders((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)));
    logActivity("updated", "reminder", r.title || "Reminder");
  }, [logActivity]);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) logActivity("deleted", "reminder", item.title);
      return prev.filter((x) => x.id !== id);
    });
  }, [logActivity]);

  return (
    <StoreContext.Provider
      value={{
        products, subscriptions, rentRecords, reminders, activityLog,
        addProduct, updateProduct, deleteProduct,
        addSubscription, updateSubscription, deleteSubscription,
        addRentRecord, updateRentRecord, deleteRentRecord,
        addReminder, updateReminder, deleteReminder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
