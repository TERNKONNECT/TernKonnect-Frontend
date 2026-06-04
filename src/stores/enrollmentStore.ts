import { create } from "zustand";
import type { EnrolledCourse, QuizAttempt } from "@/types";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const getToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("lms-auth") || "{}");
    return auth?.state?.token ?? null;
  } catch {
    return null;
  }
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const storageKey = (userId: string) => `lms-enrollment-${userId}`;

const loadFromStorage = (userId: string): EnrolledCourse[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId: string, courses: EnrolledCourse[]) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(courses));
  } catch {}
};

interface EnrollmentState {
  userId: string | null;
  enrolledCourses: EnrolledCourse[];
  initForUser: (userId: string) => void;
  clearEnrollments: () => void;
  enroll: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  completeLesson: (courseId: string, lessonId: string) => void;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  completeModule: (courseId: string, moduleId: string) => void;
  isModuleCompleted: (courseId: string, moduleId: string) => boolean;
  addQuizAttempt: (courseId: string, attempt: QuizAttempt) => void;
  getQuizAttempts: (courseId: string, quizId: string) => QuizAttempt[];
  completeCourse: (courseId: string) => void;
  getEnrolledCourse: (courseId: string) => EnrolledCourse | undefined;
  getCompletedLessonCount: (courseId: string) => number;
}

export const useEnrollmentStore = create<EnrollmentState>()((set, get) => ({
  userId: null,
  enrolledCourses: [],

  // Call this right after login/signup with the real user ID
  initForUser: (userId: string) => {
    const courses = loadFromStorage(userId);
    set({ userId, enrolledCourses: courses });
  },

  // Call this on logout
  clearEnrollments: () => {
    set({ userId: null, enrolledCourses: [] });
  },

  enroll: async (courseId) => {
    if (get().isEnrolled(courseId)) return;

    const newCourse: EnrolledCourse = {
      courseId,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      completedModules: [],
      quizAttempts: [],
      isCompleted: false,
    };

    const updated = [...get().enrolledCourses, newCourse];
    set({ enrolledCourses: updated });

    const uid = get().userId;
    if (uid) saveToStorage(uid, updated);

    try {
      await fetch(`${API_URL}/api/enrollments/${courseId}`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch {}
  },

  isEnrolled: (courseId) =>
    get().enrolledCourses.some((c) => c.courseId === courseId),

  completeLesson: (courseId, lessonId) => {
    if (get().isLessonCompleted(courseId, lessonId)) return;

    const updated = get().enrolledCourses.map((c) =>
      c.courseId === courseId
        ? { ...c, completedLessons: [...c.completedLessons, lessonId] }
        : c,
    );
    set({ enrolledCourses: updated });

    const uid = get().userId;
    if (uid) saveToStorage(uid, updated);

    try {
      fetch(
        `${API_URL}/api/enrollments/${courseId}/lessons/${lessonId}/complete`,
        { method: "POST", headers: authHeaders() },
      );
    } catch {}
  },

  isLessonCompleted: (courseId, lessonId) => {
    const course = get().enrolledCourses.find((c) => c.courseId === courseId);
    return course?.completedLessons.includes(lessonId) ?? false;
  },

  completeModule: (courseId, moduleId) => {
    if (get().isModuleCompleted(courseId, moduleId)) return;
    const updated = get().enrolledCourses.map((c) =>
      c.courseId === courseId
        ? { ...c, completedModules: [...c.completedModules, moduleId] }
        : c,
    );
    set({ enrolledCourses: updated });
    const uid = get().userId;
    if (uid) saveToStorage(uid, updated);
  },

  isModuleCompleted: (courseId, moduleId) => {
    const course = get().enrolledCourses.find((c) => c.courseId === courseId);
    return course?.completedModules.includes(moduleId) ?? false;
  },

  addQuizAttempt: (courseId, attempt) => {
    const updated = get().enrolledCourses.map((c) =>
      c.courseId === courseId
        ? { ...c, quizAttempts: [...c.quizAttempts, attempt] }
        : c,
    );
    set({ enrolledCourses: updated });
    const uid = get().userId;
    if (uid) saveToStorage(uid, updated);
  },

  getQuizAttempts: (courseId, quizId) => {
    const course = get().enrolledCourses.find((c) => c.courseId === courseId);
    return course?.quizAttempts.filter((a) => a.quizId === quizId) ?? [];
  },

  completeCourse: (courseId) => {
    const updated = get().enrolledCourses.map((c) =>
      c.courseId === courseId
        ? { ...c, isCompleted: true, completedAt: new Date().toISOString() }
        : c,
    );
    set({ enrolledCourses: updated });
    const uid = get().userId;
    if (uid) saveToStorage(uid, updated);
  },

  getEnrolledCourse: (courseId) =>
    get().enrolledCourses.find((c) => c.courseId === courseId),

  getCompletedLessonCount: (courseId) => {
    const course = get().enrolledCourses.find((c) => c.courseId === courseId);
    return course?.completedLessons.length ?? 0;
  },
}));
