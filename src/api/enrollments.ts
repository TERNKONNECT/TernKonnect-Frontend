import api from "./axios";

export interface EnrollmentStudent {
  enrollmentId: string;
  enrolledAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  user: { id: string; name: string; email: string; createdAt: string };
  enrolledByAdmin: { id: string; name: string } | null;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
}

export interface CourseEnrollmentsResponse {
  course: { id: string; title: string; pricingType: "free" | "paid" };
  totalEnrolled: number;
  totalCompleted: number;
  students: EnrollmentStudent[];
}

export type EnrollmentSourceFilter = "all" | "admin" | "self";

export const enrollmentsApi = {
  getCourseEnrollments: (
    courseId: string,
    source: EnrollmentSourceFilter = "all",
  ): Promise<CourseEnrollmentsResponse> =>
    api
      .get(`/api/enrollments/admin/courses/${courseId}`, {
        params: source !== "all" ? { source } : undefined,
      })
      .then((r) => r.data),

  enrollUserByEmail: (
    email: string,
    courseId: string,
  ): Promise<{ message: string; enrollment: { enrollmentId: string; user: { id: string; name: string; email: string }; courseId: string; enrolledAt: string } }> =>
    api.post("/api/enrollments/admin/enroll", { email, courseId }).then((r) => r.data),
};
