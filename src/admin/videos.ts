// src/api/videos.ts
import api from "./axios";
import type { Video } from "@/types";

export const videosApi = {
  getAll: (courseId: string) =>
    api.get<Video[]>(`/api/courses/${courseId}/videos`).then((r) => r.data),

  saveYoutube: (
    courseId: string,
    data: {
      title: string;
      description: string;
      duration: string;
      difficulty: string;
      youtubeUrl: string;
    },
  ) =>
    api
      .post<Video>(`/api/courses/${courseId}/videos`, data)
      .then((r) => r.data),

  getById: (courseId: string, id: string) =>
    api.get<Video>(`/api/courses/${courseId}/videos/${id}`).then((r) => r.data),
  upload: (courseId: string, formData: FormData) =>
    api
      .post<Video>(`/api/courses/${courseId}/videos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  update: (courseId: string, id: string, data: Partial<Video>) =>
    api
      .put<Video>(`/api/courses/${courseId}/videos/${id}`, data)
      .then((r) => r.data),
  delete: (courseId: string, id: string) =>
    api.delete(`/api/courses/${courseId}/videos/${id}`).then((r) => r.data),
};
