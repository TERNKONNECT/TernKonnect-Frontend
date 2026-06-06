import api from "./axios";
import type { DashboardStats } from "@/types/admin";

export const analyticsApi = {
  getOverview: (): Promise<DashboardStats> =>
    api.get("/api/superadmin/stats").then((r) => r.data),

  getUserGrowth: async () => {
    try {
      return await api.get("/api/superadmin/user-growth").then((r) => r.data);
    } catch {
      return { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], data: [0, 0, 0, 0, 0, 0] };
    }
  },

  getEnrollmentGrowth: async () => {
    try {
      return await api.get("/api/superadmin/enrollment-growth").then((r) => r.data);
    } catch {
      return { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], data: [0, 0, 0, 0, 0, 0] };
    }
  },

  getCourseCompletion: async () => {
    try {
      return await api.get("/api/superadmin/course-completion").then((r) => r.data);
    } catch {
      return { completed: 0, inProgress: 0, notStarted: 0 };
    }
  },

  getQuizSuccess: async () => {
    try {
      return await api.get("/api/superadmin/quiz-success").then((r) => r.data);
    } catch {
      return { labels: [], passed: [], failed: [] };
    }
  },

  getPopularCourses: async () => {
    try {
      return await api.get("/api/superadmin/popular-courses").then((r) => r.data);
    } catch {
      return [];
    }
  },
};
