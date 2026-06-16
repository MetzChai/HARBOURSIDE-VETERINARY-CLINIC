import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PawPrint } from "lucide-react";

export default function ProtectedRoute({
  role,
  children,
}: {
  role: "admin" | "owner";
  children: React.ReactNode;
}) {
  const { session, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <PawPrint className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (userRole && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/user"} replace />;
  }
  return <>{children}</>;
}
