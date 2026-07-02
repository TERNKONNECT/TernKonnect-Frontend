import api from "./axios";

export interface EnrollmentStudent {
  enrollmentId: string;
  enrolledAt: string;
  isCompleted: boolean;
  completedAt: string | null;
  user: { id: string; name: string; email: string; createdAt: string };
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
}

export interface CourseEnrollmentsResponse {
  course: { id: string; title: string };
  totalEnrolled: number;
  totalCompleted: number;
  students: EnrollmentStudent[];
}

export const enrollmentsApi = {
  getCourseEnrollments: (courseId: string): Promise<CourseEnrollmentsResponse> =>
    api.get(`/api/enrollments/admin/courses/${courseId}`).then((r) => r.data),

  enrollUserByEmail: (
    email: string,
    courseId: string,
  ): Promise<{ message: string; enrollment: { enrollmentId: string; user: { id: string; name: string; email: string }; courseId: string; enrolledAt: string } }> =>
    api.post("/api/enrollments/admin/enroll", { email, courseId }).then((r) => r.data),
};
