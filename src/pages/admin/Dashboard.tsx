import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyticsApi } from "@/services/analytics";
import {
  Users,
  BookOpen,
  UserCheck,
  Layers,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Award,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats } from "@/types/admin";
import { useAuthStore } from "@/stores/authStore";

const formatStat = (value?: number) => (value ?? 0).toLocaleString();
const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value ?? 0);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<{
    labels: string[];
    data: number[];
  } | null>(null);
  const [enrollmentGrowth, setEnrollmentGrowth] = useState<{
    labels: string[];
    data: number[];
  } | null>(null);
  const [popularCourses, setPopularCourses] = useState<
    { title: string; enrollments: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === "super-admin";

  useEffect(() => {
    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getUserGrowth(),
      analyticsApi.getEnrollmentGrowth(),
      analyticsApi.getPopularCourses(),
    ])
      .then(([s, ug, eg, pc]) => {
        setStats(s);
        setUserGrowth(ug);
        setEnrollmentGrowth(eg);
        setPopularCourses(pc);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const superAdminCards = [
    {
      label: "Total Users",
      value: formatStat(stats.totalUsers),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Admins",
      value: formatStat(stats.totalAdmins),
      icon: ShieldCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Courses",
      value: formatStat(stats.totalCourses),
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Enrollments",
      value: formatStat(stats.totalEnrollments),
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Completed Courses",
      value: formatStat(stats.totalCompleted),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Paid Transactions",
      value: formatStat(stats.totalPayments),
      icon: Award,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Total Lessons",
      value: formatStat(stats.totalLessons),
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Quizzes",
      value: formatStat(stats.totalQuizzes),
      icon: HelpCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const adminCards = [
    {
      label: "Students in My Courses",
      value: formatStat(stats.totalUsers),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "My Courses",
      value: formatStat(stats.totalCourses),
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Enrollments",
      value: formatStat(stats.totalEnrollments),
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Completed",
      value: formatStat(stats.totalCompleted),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "My Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Paid Enrollments",
      value: formatStat(stats.totalPayments),
      icon: Award,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Lessons",
      value: formatStat(stats.totalLessons),
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Quizzes",
      value: formatStat(stats.totalQuizzes),
      icon: HelpCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Active Students",
      value: formatStat(stats.activeUsers),
      icon: UserCheck,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  const operatorCards = [
    {
      label: "Students in My Courses",
      value: formatStat(stats.totalUsers),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "My Courses",
      value: formatStat(stats.totalCourses),
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Enrollments",
      value: formatStat(stats.totalEnrollments),
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Completed",
      value: formatStat(stats.totalCompleted),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Lessons",
      value: formatStat(stats.totalLessons),
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Quizzes",
      value: formatStat(stats.totalQuizzes),
      icon: HelpCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Active Students",
      value: formatStat(stats.activeUsers),
      icon: UserCheck,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
  ];

  const statCards = isSuperAdmin
    ? superAdminCards
    : user?.role === "admin"
      ? adminCards
      : operatorCards;

  const completionRate = stats.completionRate ?? 0;

  // Transform data for recharts
  const formatChartData = (growthData: { labels: string[]; data: number[] }) => {
    return growthData.labels.map((label, index) => ({
      name: label,
      value: growthData.data[index],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSuperAdmin ? "Platform Overview" : "My Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Complete overview of the entire platform"
              : "Analytics and activity for your courses"}
          </p>
        </div>
        {stats.completionRate !== undefined && (
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground">
              Completion Rate
            </span>
            <span className="text-2xl font-bold text-emerald-600">
              {completionRate}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl ${s.bg} p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {userGrowth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isSuperAdmin
                  ? "User Signups (6 months)"
                  : "Enrollments (6 months)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData(userGrowth)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(222, 47%, 31%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(222, 47%, 31%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {enrollmentGrowth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isSuperAdmin
                  ? "Platform Enrollments (6 months)"
                  : "Course Enrollments (6 months)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData(enrollmentGrowth)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(142, 50%, 35%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 50%, 35%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isSuperAdmin
              ? "Most Popular Courses (Platform)"
              : "My Course Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrollments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularCourses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center py-8"
                  >
                    No enrollment activity yet.
                  </TableCell>
                </TableRow>
              ) : (
                popularCourses.map((course, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.enrollments}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
