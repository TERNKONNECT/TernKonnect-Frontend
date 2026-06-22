import type { DashboardStats } from "../types/admin";

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:9000";

const getAuthHeaders = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("lms-auth") || "{}");
    const token = auth?.state?.token ?? localStorage.getItem("lms_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    const token = localStorage.getItem("lms_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export const analyticsApi = {
  getOverview: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_URL}/api/superadmin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  getUserGrowth: async (): Promise<{ labels: string[]; data: number[] }> => {
    const res = await fetch(`${API_URL}/api/superadmin/user-growth`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user growth");
    return res.json();
  },

  getEnrollmentGrowth: async (): Promise<{ labels: string[]; data: number[] }> => {
    const res = await fetch(`${API_URL}/api/superadmin/enrollment-growth`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch enrollment growth");
    return res.json();
  },

  getPopularCourses: async (): Promise<{ title: string; enrollments: number }[]> => {
    const res = await fetch(`${API_URL}/api/superadmin/popular-courses`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch popular courses");
    return res.json();
  },
};
