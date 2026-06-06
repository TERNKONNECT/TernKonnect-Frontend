export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "super-admin";
  avatar?: string;
  isBlocked: boolean;
  enrolledCourses: string[];
  quizScores: { quizId: string; score: number; total: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCourse {
  id: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  thumbnail?: string;
  introVideoUrl?: string;
  status: "draft" | "published";
  modules?: AdminModule[];
  instructor?: { id: string; name: string; email: string };
  whatYouLearn?: string[];
  pricingType?: "free" | "paid";
  price?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons?: AdminLesson[];
  quiz?: AdminQuiz | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLesson {
  id: string;
  moduleId: string;
  title: string;
  type: "video" | "text";
  content?: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id?: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface AdminQuiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalQuizzes: number;
  activeUsers: number;
  totalCompleted: number;
  totalPayments: number;
  totalRevenue: number;
  completionRate: number;
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}
