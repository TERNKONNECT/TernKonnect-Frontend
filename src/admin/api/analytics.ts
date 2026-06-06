import type { DashboardStats } from '@/types';

const MOCK_DELAY = 400;

export const analyticsApi = {
  getOverview: async (): Promise<DashboardStats> => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return { totalUsers: 1284, totalCourses: 42, totalEnrollments: 3856, totalLessons: 318, totalQuizzes: 96, activeUsers: 847 };
  },
  getUserGrowth: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [120, 210, 340, 480, 620, 847] };
  },
  getEnrollmentGrowth: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [450, 820, 1400, 2100, 2900, 3856] };
  },
  getCourseCompletion: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return { completed: 68, inProgress: 22, notStarted: 10 };
  },
  getQuizSuccess: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return { labels: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'], passed: [85, 72, 68, 90, 45], failed: [15, 28, 32, 10, 55] };
  },
  getPopularCourses: async () => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    return [
      { title: 'TypeScript Essentials', enrollments: 320 },
      { title: 'React Masterclass', enrollments: 245 },
      { title: 'Node.js Advanced', enrollments: 180 },
      { title: 'Python Basics', enrollments: 156 },
      { title: 'AWS Fundamentals', enrollments: 134 },
    ];
  },
};
