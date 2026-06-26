import api from "./axios";
import type { AdminQuiz } from "@/types/admin";

export const quizzesApi = {
  getAll: () => api.get<AdminQuiz[]>("/api/quizzes").then((r) => r.data),

  get: (courseId: string, moduleId: string) =>
    api.get<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`).then((r) => r.data),

  create: (courseId: string, moduleId: string, data: Partial<AdminQuiz>) =>
    api.post<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data).then((r) => r.data),

  update: (courseId: string, moduleId: string, data: Partial<AdminQuiz>) =>
    api.put<AdminQuiz>(`/api/courses/${courseId}/modules/${moduleId}/quiz`, data).then((r) => r.data),

  delete: (courseIdOrId: string, moduleId?: string) => {
    if (!moduleId) {
      // If only one argument is provided, assume it's the quiz ID
      return api.delete(`/api/quizzes/${courseIdOrId}`).then((r) => r.data);
    }
    return api.delete(`/api/courses/${courseIdOrId}/modules/${moduleId}/quiz`).then((r) => r.data);
  },
};
