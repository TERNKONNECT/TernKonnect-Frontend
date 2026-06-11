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
  ): Promise<{ avatar: string }> => {
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
};
