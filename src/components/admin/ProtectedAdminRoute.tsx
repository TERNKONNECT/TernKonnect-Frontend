import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface RouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: RouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin" && user?.role !== "super-admin")
    return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function SuperAdminRoute({ children }: RouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "super-admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
