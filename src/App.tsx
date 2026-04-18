import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, can, type Permission } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { seedDemoData } from "@/lib/store";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ClientsPage from "./pages/ClientsPage";
import OperationsPage from "./pages/OperationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import DeliveryPage from "./pages/DeliveryPage";
import DirectoriesPage from "./pages/DirectoriesPage";
import EmployeesPage from "./pages/EmployeesPage";
import DefectsPage from "./pages/DefectsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function Guard({ perm, children }: { perm: Permission; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!can(user, perm)) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h2 className="text-lg font-semibold">Доступ запрещён</h2>
        <p className="text-sm text-muted-foreground mt-2">У вашей роли нет прав для этого раздела.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  useEffect(() => { seedDemoData(); }, []);

  if (!user) return <LoginPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Guard perm="orders.advance"><OrdersPage /></Guard>} />
        <Route path="/clients" element={<Guard perm="clients.write"><ClientsPage /></Guard>} />
        <Route path="/operations" element={<Guard perm="operations.write"><OperationsPage /></Guard>} />
        <Route path="/defects" element={<Guard perm="defects.write"><DefectsPage /></Guard>} />
        <Route path="/payments" element={<Guard perm="payments.write"><PaymentsPage /></Guard>} />
        <Route path="/delivery" element={<Guard perm="delivery.write"><DeliveryPage /></Guard>} />
        <Route path="/notifications" element={<Guard perm="notifications.write"><NotificationsPage /></Guard>} />
        <Route path="/employees" element={<Guard perm="employees.view"><EmployeesPage /></Guard>} />
        <Route path="/directories" element={<Guard perm="directories.view"><DirectoriesPage /></Guard>} />
        <Route path="/reports" element={<Guard perm="reports.view"><ReportsPage /></Guard>} />
        <Route path="/settings" element={<Guard perm="settings.view"><SettingsPage /></Guard>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
