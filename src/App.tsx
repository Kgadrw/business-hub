import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider, useStore } from "@/store/useStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import RentPage from "./pages/RentPage";
import RemindersPage from "./pages/RemindersPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const GlobalLoadingOverlay = () => {
  const { isLoading } = useStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-foreground">Loading data...</span>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <GlobalLoadingOverlay />
        <BrowserRouter>
          <Routes>
            {/* Public routes (no sidebar/layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* App routes (with sidebar/layout) */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
              <Route path="/subscriptions" element={<RequireAuth><SubscriptionsPage /></RequireAuth>} />
              <Route path="/rent" element={<RequireAuth><RentPage /></RequireAuth>} />
              <Route path="/reminders" element={<RequireAuth><RemindersPage /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
