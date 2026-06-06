import api from "./axios";

export interface InstructorSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  totalCourses: number;
  totalEnrollments: number;
  totalCompleted: number;
  completionRate: number;
}

export interface StudentProgress {
  enrollmentId: string;
  enrolledAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  user: { id: string; name: string; email: string };
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
}

export interface CourseWithStats {
  id: string;
  title: string;
  difficulty: string;
  status: string;
  createdAt: string;
  totalLessons: number;
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  students: StudentProgress[];
}

export interface InstructorDetail {
  instructor: { id: string; name: string; email: string; joinedAt: string };
  totalCourses: number;
  courses: CourseWithStats[];
}

export interface SuperAdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCompleted: number;
  completionRate: number;
}

export const superAdminApi = {
  getStats: (): Promise<SuperAdminStats> =>
    api.get("/api/superadmin/stats").then((r) => r.data),

  getInstructors: (): Promise<InstructorSummary[]> =>
    api.get("/api/superadmin/instructors").then((r) => r.data),

  getInstructorDetail: (id: string): Promise<InstructorDetail> =>
    api.get(`/api/superadmin/instructors/${id}`).then((r) => r.data),
};
