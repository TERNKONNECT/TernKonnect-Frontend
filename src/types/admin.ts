export interface DashboardStats {
  totalUsers?: number;
  totalAdmins?: number;
  totalCourses?: number;
  totalEnrollments?: number;
  totalLessons?: number;
  totalQuizzes?: number;
  activeUsers?: number;
  totalCompleted?: number;
  totalPayments?: number;
  totalRevenue?: number;
  completionRate?: number;
}

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

export interface AdminCourse {
  id?: string;
  _id?: string;
  createdBy?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnailCloudinaryId?: string;
  introVideoUrl?: string;
  introVideoCloudinaryId?: string;
  difficulty?: string;
  status?: string;
  pricingType?: "free" | "paid";
  price?: number;
  currency?: string;
  whatYouLearn?: string[];
  createdAt?: string;
  updatedAt?: string;
  instructor?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    title?: string;
    bio?: string;
    avatar?: string;
    avatarCloudinaryId?: string;
  };
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
