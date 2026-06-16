import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:9000";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, userType: "learner" | "educator") => Promise<boolean>;
  instructorSignup: (name: string, email: string, password: string) => Promise<string>;
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
          role: data.user.role || "user",
          userType: data.user.userType || "learner",
        };

        set({ user, token: data.token, isAuthenticated: true });
        localStorage.setItem("lms_token", data.token);
        localStorage.setItem("lms_user", JSON.stringify(user));

        // Load THIS user's enrollment data immediately after login
        const { useEnrollmentStore } = await import("./enrollmentStore");
        useEnrollmentStore.getState().initForUser(user.id);

        return user;
      },

      signup: async (name: string, email: string, password: string, userType: "learner" | "educator") => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, userType }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        const user: User = {
          id: data.user._id ?? data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.name}`,
          joinedAt: data.user.createdAt,
          role: data.user.role || "user",
          userType: data.user.userType || "learner",
        };

        set({ user, token: data.token, isAuthenticated: true });
        localStorage.setItem("lms_token", data.token);
        localStorage.setItem("lms_user", JSON.stringify(user));

        // New user — initialize with empty enrollments
        const { useEnrollmentStore } = await import("./enrollmentStore");
        useEnrollmentStore.getState().initForUser(user.id);

        return true;
      },

      instructorSignup: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/register-instructor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Instructor signup failed");

        // The user is created but email is not verified yet. 
        // We do not auto-login because they must verify their email first.
        // We just return the success message from the backend.
        return data.message;
      },

      logout: () => {
        // Clear enrollment state on logout
        import("./enrollmentStore").then(({ useEnrollmentStore }) => {
          useEnrollmentStore.getState().clearEnrollments();
        });

        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
      },
    }),
    { name: "lms-auth" },
  ),
);
