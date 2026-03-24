import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePets from "./pages/admin/ManagePets";
import ManageOwners from "./pages/admin/ManageOwners";
import Vaccinations from "./pages/admin/Vaccinations";
import Schedule from "./pages/admin/Schedule";
import CareHistory from "./pages/admin/CareHistory";
import Inventory from "./pages/admin/Inventory";
import Reports from "./pages/admin/Reports";
import Reminders from "./pages/admin/Reminders";
import UserDashboard from "./pages/user/UserDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pets" element={<ManagePets />} />
            <Route path="owners" element={<ManageOwners />} />
            <Route path="vaccinations" element={<Vaccinations />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="care-history" element={<CareHistory />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reminders" element={<Reminders />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
