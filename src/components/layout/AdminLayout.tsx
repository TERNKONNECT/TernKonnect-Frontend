import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (
      user.role !== "super-admin" &&
      user.role !== "admin" &&
      user.role !== "operator"
    ) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || (user.role !== "super-admin" && user.role !== "admin" && user.role !== "operator")) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto flex flex-col min-h-screen">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{user.name}</span>
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-border"
              />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
