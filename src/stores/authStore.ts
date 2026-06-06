import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<string>;
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
          role: data.user.role ?? "user",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.name}`,
          joinedAt: data.user.createdAt,
        };

        // store token in both keys so admin api (axios) and learnflow both work
        localStorage.setItem("lms_token", data.token);
        localStorage.setItem("lms_user", JSON.stringify(user));

        set({ user, token: data.token, isAuthenticated: true });

        if (user.role === "user") {
          const { useEnrollmentStore } = await import("./enrollmentStore");
          useEnrollmentStore.getState().initForUser(user.id);
        }

        return user;
      },

      signup: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        return data.message || "Check your email to verify your account.";
      },

      logout: () => {
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
        import("./enrollmentStore").then(({ useEnrollmentStore }) => {
          useEnrollmentStore.getState().clearEnrollments();
        });
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "lms-auth" },
  ),
);
