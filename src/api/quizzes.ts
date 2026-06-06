import api from "./axios";
import type { AdminQuiz } from "@/types/admin";

export const quizzesApi = {
  get: (courseId: string, moduleId: string) =>
    api.get<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`).then((r) => r.data),

  create: (courseId: string, moduleId: string, data: Partial<AdminQuiz>) =>
    api.post<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data).then((r) => r.data),

  update: (courseId: string, moduleId: string, data: Partial<AdminQuiz>) =>
    api.put<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data).then((r) => r.data),

  delete: (courseId: string, moduleId: string) =>
    api.delete(`/api/courses/${courseId}/modules/${moduleId}/quiz`).then((r) => r.data),
};
