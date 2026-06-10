import type { InstructorSummary, InstructorDetail } from "../types/admin";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

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

export const superAdminApi = {
  getInstructors: async (): Promise<InstructorSummary[]> => {
    const res = await fetch(`${API_URL}/api/superadmin/instructors`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch instructors");
    return res.json();
  },

  getInstructorDetail: async (id: string): Promise<InstructorDetail> => {
    const res = await fetch(`${API_URL}/api/superadmin/instructors/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch instructor detail");
    return res.json();
  },

  inviteInstructor: async (
    name: string,
    email: string,
    role: "admin" | "operator" = "admin"
  ): Promise<{ message: string; instructor: InstructorSummary }> => {
    const res = await fetch(`${API_URL}/api/superadmin/instructors/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to invite instructor");
    return data;
  },
};
