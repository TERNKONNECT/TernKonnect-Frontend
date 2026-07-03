import api from "./axios";

export interface PendingPayment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface PaymentRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "abandoned";
  channel: string;
  paidAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string };
}

export interface PaymentsListResponse {
  payments: PaymentRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentsListFilters {
  status?: PaymentRecord["status"];
  courseId?: string;
  page?: number;
  limit?: number;
}

export interface MonthlyRevenue {
  month: string;
  label: string;
  revenue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  currentMonthRevenue: number;
  monthly: MonthlyRevenue[];
  statusBreakdown: {
    pending: number;
    success: number;
    failed: number;
    abandoned: number;
  };
}

export interface BulkVerifyResult {
  processed: number;
  remaining: number;
  summary: Record<string, number>;
  results: { reference: string; status: string; error?: string; courseTitle?: string }[];
}

export const paymentsApi = {
  getPendingForCourse: (courseId: string): Promise<PendingPayment[]> =>
    api
      .get(`/api/payments/admin/courses/${courseId}/pending`)
      .then((r) => r.data),

  verifyPayment: (
    reference: string,
  ): Promise<{ status: string; error?: string; courseId: string; courseTitle?: string }> =>
    api
      .post(`/api/payments/admin/verify/${reference}`)
      .then((r) => r.data)
      .catch((err) => {
        if (err.response?.data) return err.response.data;
        throw err;
      }),

  getAll: (filters: PaymentsListFilters = {}): Promise<PaymentsListResponse> =>
    api
      .get("/api/payments/admin/all", { params: filters })
      .then((r) => r.data),

  getRevenue: (): Promise<RevenueStats> =>
    api.get("/api/payments/admin/revenue").then((r) => r.data),

  verifyBulk: (courseId?: string): Promise<BulkVerifyResult> =>
    api
      .post("/api/payments/admin/verify-bulk", courseId ? { courseId } : {})
      .then((r) => r.data),
};
