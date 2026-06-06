import api from "./axios";
import type { AdminCourse } from "@/types/admin";

const uploadToSignedUrl = (
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void,
) =>
  new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Video upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error during video upload"));
    xhr.send(file);
  });

export const coursesApi = {
  getAll: () => api.get<AdminCourse[]>("/api/courses").then((r) => r.data),

  getById: (id: string) =>
    api.get<AdminCourse>(`/api/courses/${id}`).then((r) => r.data),

  create: (data: Partial<AdminCourse>) =>
    api.post<AdminCourse>("/api/courses", data).then((r) => r.data),

  update: (id: string, data: Partial<AdminCourse>) =>
    api.put<AdminCourse>(`/api/courses/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/courses/${id}`).then((r) => r.data),

  saveIntroVideoUrl: (id: string, introVideoUrl: string): Promise<AdminCourse> =>
    api
      .post<AdminCourse>(`/api/courses/${id}/intro-video-url`, {
        introVideoUrl,
        introVideoCloudinaryId: "",
      })
      .then((r) => r.data),

  uploadThumbnail: async (
    id: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<AdminCourse> => {
    const formData = new FormData();
    formData.append("thumbnail", file);

    const res = await api.post<AdminCourse>(`/api/courses/${id}/thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return res.data;
  },

  uploadIntroVideo: async (
    id: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<AdminCourse> => {
    try {
      const upload = await api
        .post<{ uploadUrl: string; key: string; url: string }>(
          `/api/courses/${id}/intro-video-upload-url`,
          {
            filename: file.name,
            contentType: file.type || "application/octet-stream",
          },
        )
        .then((r) => r.data);

      await uploadToSignedUrl(upload.uploadUrl, file, onProgress);

      return api
        .post<AdminCourse>(`/api/courses/${id}/intro-video-url`, {
          introVideoUrl: upload.url,
          introVideoCloudinaryId: upload.key,
        })
        .then((r) => r.data);
    } catch {
    const formData = new FormData();
    formData.append("video", file);

    const res = await api.post<AdminCourse>(`/api/courses/${id}/intro-video`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return res.data;
    }
  },
};
