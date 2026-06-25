import api from "./axios";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  avatar: string;
  role: string;
  createdAt: string;
}

export const profileApi = {
  get: (): Promise<AdminProfile> => api.get("/api/profile").then((r) => r.data),

  update: (data: {
    name: string;
    title: string;
    bio: string;
  }): Promise<AdminProfile> =>
    api.put("/api/profile", data).then((r) => r.data),

  uploadAvatar: async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<AdminProfile> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await api.post("/api/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return res.data;
  },

  updatePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    api.put("/api/auth/password", data).then((r) => r.data),

  deactivate: (data: { password: string }): Promise<{ message: string }> =>
    api.post("/api/auth/deactivate", data).then((r) => r.data),
};
