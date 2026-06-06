import api from "./axios";
import type { AdminUser } from "@/types/admin";

export const usersApi = {
  getAll: (search = ""): Promise<AdminUser[]> =>
    api.get(`/api/superadmin/users?search=${search}`).then((r) => r.data),

  toggleBlock: (id: string): Promise<AdminUser> =>
    api.put(`/api/superadmin/users/${id}/toggle-block`).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/superadmin/users/${id}`).then((r) => r.data),
};
