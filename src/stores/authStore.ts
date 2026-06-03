import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        const user: User = {
          id: data.user._id ?? data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.name}`,
          joinedAt: data.user.createdAt,
        };

        set({ user, token: data.token, isAuthenticated: true });

        // Load THIS user's enrollment data immediately after login
        const { useEnrollmentStore } = await import("./enrollmentStore");
        useEnrollmentStore.getState().initForUser(user.id);

        return true;
      },

      signup: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        const user: User = {
          id: data.user._id ?? data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.name}`,
          joinedAt: data.user.createdAt,
        };

        set({ user, token: data.token, isAuthenticated: true });

        // New user — initialize with empty enrollments
        const { useEnrollmentStore } = await import("./enrollmentStore");
        useEnrollmentStore.getState().initForUser(user.id);

        return true;
      },

      logout: () => {
        // Clear enrollment state on logout
        import("./enrollmentStore").then(({ useEnrollmentStore }) => {
          useEnrollmentStore.getState().clearEnrollments();
        });

        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "lms-auth" },
  ),
);
