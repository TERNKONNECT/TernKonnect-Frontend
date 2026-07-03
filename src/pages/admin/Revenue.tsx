import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  paymentsApi,
  type PaymentRecord,
  type PaymentsListResponse,
  type RevenueStats,
} from "@/api/payments";
import { coursesApi } from "@/api/courses";
import type { AdminCourse } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton, StatsSkeleton } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Wallet, TrendingUp, CheckCircle2, Clock, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const formatCurrency = (v = 0, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(v);

const statusBadge = (status: PaymentRecord["status"]) => {
  switch (status) {
    case "success":
      return (
        <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="h-3 w-3" /> Success
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case "failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "abandoned":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Abandoned
        </Badge>
      );
  }
};

const Revenue = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [courses, setCourses] = useState<AdminCourse[]>([]);

  const [list, setList] = useState<PaymentsListResponse | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [courseId, setCourseId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [bulkVerifying, setBulkVerifying] = useState(false);

  const loadStats = () => {
    paymentsApi
      .getRevenue()
      .then(setStats)
      .catch(() => toast.error("Failed to load revenue stats"))
      .finally(() => setStatsLoading(false));
  };

  const loadList = () => {
    setListLoading(true);
    paymentsApi
      .getAll({
        status: status !== "all" ? (status as PaymentRecord["status"]) : undefined,
        courseId: courseId !== "all" ? courseId : undefined,
        page,
        limit: 20,
      })
      .then(setList)
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    loadStats();
    coursesApi
      .getAll()
      .then(setCourses)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, courseId, page]);

  const handleVerifyRow = async (p: PaymentRecord) => {
    setVerifyingRef(p.reference);
    try {
      const result = await paymentsApi.verifyPayment(p.reference);
      if (result.status === "success") {
        toast.success(`${p.user.name}'s payment verified — enrolled successfully.`);
      } else if (result.status === "pending") {
        toast.info(result.error || "Payment is still processing on Paystack's side.");
      } else {
        toast.error(result.error || "Payment was not successful.");
      }
      loadList();
      loadStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to verify payment");
    } finally {
      setVerifyingRef(null);
    }
  };

  const handleVerifyBulk = async () => {
    setBulkVerifying(true);
    try {
      const result = await paymentsApi.verifyBulk(courseId !== "all" ? courseId : undefined);
      const verified = result.summary.success || 0;
      const stillPending = result.summary.pending || 0;
      const failed = (result.summary.failed || 0) + (result.summary.error || 0);
      toast.success(
        `Processed ${result.processed} payment${result.processed === 1 ? "" : "s"}: ` +
          `${verified} verified, ${stillPending} still pending, ${failed} failed.` +
          (result.remaining > 0 ? ` ${result.remaining} more pending — click again to continue.` : ""),
      );
      loadList();
      loadStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to run bulk verification");
    } finally {
      setBulkVerifying(false);
    }
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  const totalPages = list ? Math.max(1, Math.ceil(list.total / list.limit)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track payments, their status, and revenue across your courses
        </p>
      </div>

      {statsLoading ? (
        <StatsSkeleton count={2} />
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.currentMonthRevenue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue (last 12 months)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <Bar
              options={chartOpts}
              data={{
                labels: stats.monthly.map((m) => m.label),
                datasets: [
                  {
                    label: "Revenue",
                    data: stats.monthly.map((m) => m.revenue),
                    backgroundColor: "hsl(222, 47%, 31%)",
                    borderRadius: 4,
                  },
                ],
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Payments</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={bulkVerifying || !stats?.statusBreakdown.pending}
            onClick={handleVerifyBulk}
          >
            {bulkVerifying ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Verify All Pending
            {stats?.statusBreakdown.pending ? ` (${stats.statusBreakdown.pending})` : ""}
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={courseId}
              onValueChange={(v) => {
                setCourseId(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id!}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {listLoading ? (
            <TableSkeleton />
          ) : !list?.payments.length ? (
            <EmptyState title="No payments found" description="No payments match these filters." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.course ? (
                          <Link
                            to={`/dashboard/courses/${p.course.id}/enrollments`}
                            className="hover:underline"
                          >
                            {p.course.title}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(p.amount, p.currency)}
                      </TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={verifyingRef === p.reference}
                            onClick={() => handleVerifyRow(p)}
                            className="gap-1.5"
                          >
                            {verifyingRef === p.reference ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {list.page} of {totalPages} ({list.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
