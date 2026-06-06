export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super-admin";
  avatar?: string;
  joinedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: Instructor;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  reviewCount: number;
  totalStudents: number;
  whatYouLearn: string[];
  modules: Module[];
  reviews: Review[];
  isFeatured?: boolean;
  pricingType?: "free" | "paid";
  price?: number;
  currency?: string;
  hasAccess?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  courseCount: number;
  studentCount: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
  quizId?: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  order: number;
  type: "video" | "reading" | "exercise";
  locked?: boolean;
}

export interface Quiz {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAttempt {
  quizId: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface EnrolledCourse {
  courseId: string;
  enrolledAt: string;
  completedLessons: string[];
  completedModules: string[];
  quizAttempts: QuizAttempt[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export type Category =
  | "Web Development"
  | "Data Science"
  | "Design"
  | "Mobile Development"
  | "Cloud Computing"
  | "AI & Machine Learning";

export const CATEGORIES: Category[] = [
  "Web Development",
  "Data Science",
  "Design",
  "Mobile Development",
  "Cloud Computing",
  "AI & Machine Learning",
];
