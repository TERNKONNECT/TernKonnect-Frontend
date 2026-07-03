import api from "./axios";
import type { AdminUser } from "@/types/admin";

export interface BulkOnboardResultDetail {
  row: number;
  email: string;
  status: "created" | "re-invited" | "skipped" | "failed";
  reason?: string;
  emailSent?: boolean;
}

export interface BulkOnboardResult {
  total: number;
  created: number;
  reInvited: number;
  skipped: number;
  failed: number;
  details: BulkOnboardResultDetail[];
}

export const usersApi = {
  getAll: (search = ""): Promise<AdminUser[]> =>
    api.get(`/api/superadmin/users?search=${search}`).then((r) => r.data),

  toggleBlock: (id: string): Promise<AdminUser> =>
    api.put(`/api/superadmin/users/${id}/toggle-block`).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/superadmin/users/${id}`).then((r) => r.data),

  downloadBulkTemplate: async (): Promise<void> => {
    const response = await api.get("/api/superadmin/bulk-onboard/template", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_onboard_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  uploadBulkCsv: (file: File): Promise<BulkOnboardResult> => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/api/superadmin/bulk-onboard/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
