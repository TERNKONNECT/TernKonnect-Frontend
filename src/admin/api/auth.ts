import api from "./axios";
import type { AuthResponse } from "@/types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post("/api/auth/login", { email, password });
    if (
      res.data.user.role !== "admin" &&
      res.data.user.role !== "super-admin"
    ) {
      throw new Error("Access denied. Admins only.");
    }
    return res.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    const res = await api.post("/api/auth/register-admin", {
      name,
      email,
      password,
    });
    return res.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
  },
};
