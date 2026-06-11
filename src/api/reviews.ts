import api from "./axios";

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  User: { id: string; name: string; email: string; avatar: string };
}

export interface ReviewsResponse {
  avgRating: number;
  totalReviews: number;
  reviews: Review[];
}

export const reviewsApi = {
  getCourseReviews: (courseId: string): Promise<ReviewsResponse> =>
    api.get(`/api/reviews/${courseId}/admin`).then((r) => r.data),
};
