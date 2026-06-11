import api from "./axios";
import type { Quiz } from "@/types";

export const quizzesApi = {
  get: (courseId: string, moduleId: string) =>
    api
      .get<Quiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`)
      .then((r) => r.data),

  create: (courseId: string, moduleId: string, data: Partial<Quiz>) =>
    api
      .post<Quiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data)
      .then((r) => r.data),

  update: (courseId: string, moduleId: string, data: Partial<Quiz>) =>
    api
      .put<Quiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data)
      .then((r) => r.data),

  delete: (courseId: string, moduleId: string) =>
    api
      .delete(`/api/courses/${courseId}/modules/${moduleId}/quiz`)
      .then((r) => r.data),
};
