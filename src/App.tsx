import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  useEffect(() => { seedDemoData(); }, []);

  if (!user) return <LoginPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
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
