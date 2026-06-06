import api from "./axios";
import type { AdminModule } from "@/types/admin";

export const modulesApi = {
  getAll: (courseId: string) =>
    api.get<AdminModule[]>(`/api/courses/${courseId}/modules`).then((r) => r.data),

  create: (courseId: string, data: { title: string; order: number }) =>
    api.post<AdminModule>(`/api/courses/${courseId}/modules`, data).then((r) => r.data),

  update: (courseId: string, moduleId: string, data: Partial<AdminModule>) =>
    api.put<AdminModule>(`/api/courses/${courseId}/modules/${moduleId}`, data).then((r) => r.data),

  delete: (courseId: string, moduleId: string) =>
    api.delete(`/api/courses/${courseId}/modules/${moduleId}`).then((r) => r.data),
};
