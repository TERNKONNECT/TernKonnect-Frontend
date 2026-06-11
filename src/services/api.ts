import { courses, quizzes } from "@/data/courses";
import type { Course, Quiz, Module, Lesson } from "@/types";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const getToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("lms-auth") || "{}");
    return auth?.state?.token ?? localStorage.getItem("lms_token");
  } catch {
    return localStorage.getItem("lms_token");
  }
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Map backend lesson → frontend Lesson
const mapLesson = (l: any): Lesson => ({
  id: l.id,
  moduleId: l.moduleId,
  title: l.title,
  description: l.content || "",
  duration: l.duration || "",
  videoUrl: l.videoUrl || "",
  order: l.order,
  type: l.type === "video" ? "video" : "reading",
  locked: Boolean(l.locked),
});

// Map backend module → frontend Module
const mapModule = (m: any): Module => ({
  id: m.id,
  courseId: m.courseId,
  title: m.title,
  order: m.order,
  lessons: (m.lessons ?? []).map(mapLesson),
  quizId: m.quiz?.id ?? undefined,
});

// Map backend course → frontend Course
// const mapBackendCourse = (c: any): Course => ({
//   id: c.id,
//   title: c.title,
//   shortDescription: c.description || "",
//   description: c.description || "",
//   thumbnail:
//     c.thumbnail ||
//     "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
//   instructor: {
//     id: "instructor",
//     name: "TekConnect Instructor",
//     title: "",
//     bio: "",
//     avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
//     courseCount: 0,
//     studentCount: 0,
//   },
//   category: c.difficulty || "General",
//   level: (c.difficulty as Course["level"]) || "Beginner",
//   duration: "",
//   rating: 0,
//   reviewCount: 0,
//   totalStudents: 0,
//   whatYouLearn: [],
//   modules: (c.modules ?? []).map(mapModule),
//   reviews: [],
//   isFeatured: c.status === "published",
// });

const mapBackendCourse = (c: any): Course => ({
  id: c.id,
  title: c.title,
  shortDescription: c.description || "",
  description: c.description || "",
  thumbnail:
    c.thumbnail ||
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
  instructor: {
    id: c.instructor?.id ?? c.createdBy ?? "instructor",
    name: c.instructor?.name ?? "DWSAcademy  Instructor",
    title: c.instructor?.title ?? "",
    bio: c.instructor?.bio ?? "",
    avatar:
      c.instructor?.avatar ??
      `https://api.dicebear.com/7.x/initials/svg?seed=TC`,
    courseCount: 0,
    studentCount: 0,
  },
  category: c.difficulty || "General",
  level: (c.difficulty as Course["level"]) || "Beginner",
  duration: "",
  rating: 0,
  reviewCount: 0,
  totalStudents: 0,
  whatYouLearn: c.whatYouLearn ?? [],
  modules: (c.modules ?? []).map(mapModule),
  reviews: [],
  isFeatured: c.status === "published",
  pricingType: c.pricingType ?? "free",
  price: Number(c.price || 0),
  currency: c.currency ?? "NGN",
  hasAccess: Boolean(c.hasAccess),
});

// Map backend quiz → frontend Quiz
const mapQuiz = (q: any, courseId: string): Quiz => ({
  id: q.id,
  courseId,
  moduleId: q.moduleId,
  title: q.title,
  questions: (q.questions ?? []).map((question: any, i: number) => ({
    id: question._id || `q-${i}`,
    question: question.text,
    options: question.options,
    correctAnswer: question.correctIndex,
    explanation: "",
  })),
});

export const api = {
  // Fetch all courses from backend, fall back to mock
  getCourses: async (): Promise<Course[]> => {
    try {
      const res = await fetch(`${API_URL}/api/courses`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const backendCourses = data.map(mapBackendCourse);
      // merge with mock courses so mock data still works
      return [...backendCourses, ...courses];
    } catch {
      await delay(300);
      return courses;
    }
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    // Check mock data first
    const mock = courses.find((c) => c.id === id);
    if (mock) return mock;

    // Fetch from backend — GET /api/courses/:id returns full structure
    try {
      const res = await fetch(`${API_URL}/api/courses/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return mapBackendCourse(data);
    } catch {
      return undefined;
    }
  },

  // Add these to the existing api object

  submitReview: async (
    courseId: string,
    rating: number,
    comment: string,
  ): Promise<void> => {
    const res = await fetch(`${API_URL}/api/reviews/${courseId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to submit review");
  },

  getCourseReviews: async (courseId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${courseId}`);
      if (!res.ok) return { avgRating: 0, totalReviews: 0, reviews: [] };
      return res.json();
    } catch {
      return { avgRating: 0, totalReviews: 0, reviews: [] };
    }
  },

  initializePayment: async (courseId: string) => {
    const res = await fetch(`${API_URL}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to start payment");
    return data as {
      reference: string;
      authorizationUrl: string;
      amount: number;
      currency: string;
    };
  },

  verifyPayment: async (reference: string) => {
    const res = await fetch(`${API_URL}/api/payments/verify/${reference}`, {
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.error || "Payment was not successful");
      err.courseId = data.courseId;
      err.courseTitle = data.courseTitle;
      throw err;
    }
    return data as {
      status: string;
      courseId: string;
      courseTitle?: string;
      error?: string;
    };
  },

  getInstructorProfile: async (adminId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/profile/${adminId}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  searchCourses: async (
    query: string,
    category?: string,
  ): Promise<Course[]> => {
    const all = await api.getCourses();
    let filtered = all;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.instructor.name.toLowerCase().includes(q),
      );
    }
    if (category) {
      filtered = filtered.filter((c) => c.category === category);
    }
    return filtered;
  },

  getFeaturedCourses: async (): Promise<Course[]> => {
    const all = await api.getCourses();
    return all.filter((c) => c.isFeatured);
  },

  // Fetch quiz by id — search through course modules
  getQuiz: async (quizId: string): Promise<Quiz | undefined> => {
    // Check mock data first
    const mock = quizzes.find((q) => q.id === quizId);
    if (mock) return mock;

    try {
      // Fetch all courses then find the module whose quiz.id matches
      const res = await fetch(`${API_URL}/api/courses`);
      if (!res.ok) return undefined;
      const allCourses = await res.json();

      for (const course of allCourses) {
        const courseRes = await fetch(`${API_URL}/api/courses/${course.id}`);
        if (!courseRes.ok) continue;
        const courseData = await courseRes.json();

        for (const mod of courseData.modules ?? []) {
          if (mod.quiz?.id === quizId) {
            return mapQuiz(mod.quiz, courseData.id);
          }
        }
      }
      return undefined;
    } catch {
      return undefined;
    }
  },
};


