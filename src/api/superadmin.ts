import api from "./axios";

export interface InstructorSummary {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  inviteStatus?: "pending" | "accepted";
  inviteExpiresAt?: string | null;
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

export const superAdminApi = {
  getInstructors: (): Promise<InstructorSummary[]> =>
    api.get("/api/superadmin/instructors").then((r) => r.data),

  getInstructorDetail: (id: string): Promise<InstructorDetail> =>
    api.get(`/api/superadmin/instructors/${id}`).then((r) => r.data),

  inviteInstructor: (
    name: string,
    email: string,
  ): Promise<{ message: string; instructor: InstructorSummary }> =>
    api
      .post("/api/superadmin/instructors/invite", { name, email })
      .then((r) => r.data),
};
