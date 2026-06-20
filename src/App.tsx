import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePets from "./pages/admin/ManagePets";
import ManageOwners from "./pages/admin/ManageOwners";
import Vaccinations from "./pages/admin/Vaccinations";
import Dewormings from "./pages/admin/Dewormings";
import Schedule from "./pages/admin/Schedule";
import CareHistory from "./pages/admin/CareHistory";
import Inventory from "./pages/admin/Inventory";
import LabTransactions from "./pages/admin/LabTransactions";
import Messaging from "./pages/admin/Messaging";
import Reports from "./pages/admin/Reports";
import Reminders from "./pages/admin/Reminders";
import UserDashboard from "./pages/user/UserDashboard";
import UserPets from "./pages/user/UserPets";
import UserAppointments from "./pages/user/UserAppointments";
import UserVaccinations from "./pages/user/UserVaccinations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="pets" element={<ManagePets />} />
              <Route path="owners" element={<ManageOwners />} />
              <Route path="vaccinations" element={<Vaccinations />} />
              <Route path="dewormings" element={<Dewormings />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="care-history" element={<CareHistory />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="transactions" element={<LabTransactions />} />
              <Route path="messages" element={<Messaging />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reminders" element={<Reminders />} />
            </Route>

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute role="owner">
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserDashboard />} />
              <Route path="pets" element={<UserPets />} />
              <Route path="appointments" element={<UserAppointments />} />
              <Route path="vaccinations" element={<UserVaccinations />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
