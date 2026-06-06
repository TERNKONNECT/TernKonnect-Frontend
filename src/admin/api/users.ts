import type { User } from '@/types';

const MOCK_DELAY = 400;

const mockUsers: User[] = [
  { _id: '1', name: 'Sarah Connor', email: 'sarah@example.com', role: 'user', isBlocked: false, enrolledCourses: ['1', '2'], quizScores: [{ quizId: '1', score: 8, total: 10 }], createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-03-01T10:00:00Z' },
  { _id: '2', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', isBlocked: false, enrolledCourses: ['1'], quizScores: [{ quizId: '1', score: 6, total: 10 }], createdAt: '2025-02-15T10:00:00Z', updatedAt: '2025-03-10T10:00:00Z' },
  { _id: '3', name: 'Emily Chen', email: 'emily@example.com', role: 'user', isBlocked: true, enrolledCourses: ['2', '4'], quizScores: [], createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-03-05T10:00:00Z' },
  { _id: '4', name: 'David Park', email: 'david@example.com', role: 'user', isBlocked: false, enrolledCourses: ['1', '2', '4'], quizScores: [{ quizId: '1', score: 9, total: 10 }], createdAt: '2024-12-05T10:00:00Z', updatedAt: '2025-02-20T10:00:00Z' },
  { _id: '5', name: 'Lisa Wang', email: 'lisa@example.com', role: 'user', isBlocked: false, enrolledCourses: ['4'], quizScores: [{ quizId: '1', score: 7, total: 10 }], createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-03-20T10:00:00Z' },
];

export const usersApi = {
  getAll: async (search = ''): Promise<User[]> => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    if (search) return mockUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    return mockUsers;
  },
  toggleBlock: async (id: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
    const user = mockUsers.find((u) => u._id === id);
    if (!user) throw new Error('User not found');
    return { ...user, isBlocked: !user.isBlocked };
  },
  delete: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, MOCK_DELAY));
  },
};
