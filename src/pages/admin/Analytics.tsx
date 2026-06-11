import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsSkeleton } from '@/components/shared/SkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { DashboardStats } from '@/types/admin';
import { TrendingUp, Users, CheckCircle2, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const formatCurrency = (v = 0) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(v);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enrollmentGrowth, setEnrollmentGrowth] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [completion, setCompletion] = useState<{ completed: number; inProgress: number; notStarted: number } | null>(null);
  const [quizSuccess, setQuizSuccess] = useState<{ labels: string[]; passed: number[]; failed: number[] } | null>(null);
  const [popular, setPopular] = useState<{ title: string; enrollments: number }[]>([]);

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === 'super-admin';

  useEffect(() => {
    Promise.all([
      analyticsApi.getOverview(),
      analyticsApi.getEnrollmentGrowth(),
      analyticsApi.getCourseCompletion(),
      analyticsApi.getQuizSuccess(),
      analyticsApi.getPopularCourses(),
    ])
      .then(([s, eg, cc, qs, pc]) => {
        setStats(s);
        setEnrollmentGrowth(eg);
        setCompletion(cc);
        setQuizSuccess(qs);
        setPopular(pc);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <StatsSkeleton count={4} />
      </div>
    );

  const chartOpts = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };

  const totalEnrolled = (completion?.completed ?? 0) + (completion?.inProgress ?? 0) + (completion?.notStarted ?? 0);
  const completionPct = totalEnrolled > 0 ? Math.round(((completion?.completed ?? 0) / totalEnrolled) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isSuperAdmin ? 'Platform Analytics' : 'My Course Analytics'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isSuperAdmin
            ? 'Real-time analytics across all courses and instructors on the platform'
            : 'Real-time analytics for your courses and students'}
        </p>
      </div>

      {/* Summary KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50"><Users className="h-4 w-4 text-blue-600" /></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  {isSuperAdmin ? 'Total Users' : 'My Students'}
                </span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalUsers ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-violet-50"><TrendingUp className="h-4 w-4 text-violet-600" /></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Enrollments</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalEnrollments ?? 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-emerald-50"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Completed</span>
              </div>
              <p className="text-2xl font-bold">{completionPct}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-yellow-50"><DollarSign className="h-4 w-4 text-yellow-600" /></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  {isSuperAdmin ? 'Total Revenue' : 'My Revenue'}
                </span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {enrollmentGrowth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isSuperAdmin ? 'Platform Enrollment Trend' : 'My Course Enrollment Trend'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <Line
                options={chartOpts}
                data={{
                  labels: enrollmentGrowth.labels,
                  datasets: [
                    {
                      label: 'Enrollments',
                      data: enrollmentGrowth.data,
                      borderColor: 'hsl(222, 47%, 31%)',
                      backgroundColor: 'hsla(222, 47%, 31%, 0.1)',
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        )}

        {completion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Completion Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={{
                    labels: ['Completed', 'In Progress', 'Not Started'],
                    datasets: [
                      {
                        data: [completion.completed, completion.inProgress, completion.notStarted],
                        backgroundColor: [
                          'hsl(142, 50%, 35%)',
                          'hsl(45, 90%, 50%)',
                          'hsl(0, 0%, 80%)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {quizSuccess && quizSuccess.labels.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quiz Success Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <Bar
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                }}
                data={{
                  labels: quizSuccess.labels,
                  datasets: [
                    { label: 'Passed', data: quizSuccess.passed, backgroundColor: 'hsl(142, 50%, 35%)' },
                    { label: 'Failed', data: quizSuccess.failed, backgroundColor: 'hsl(0, 84%, 60%)' },
                  ],
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isSuperAdmin ? 'Most Popular Courses (Platform)' : 'My Course Rankings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popular.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No enrollment data yet.</p>
            ) : (
              <div className="space-y-3">
                {popular.map((course, idx) => {
                  const maxEnrollments = popular[0]?.enrollments || 1;
                  const pct = Math.round((course.enrollments / maxEnrollments) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium truncate max-w-[200px]">{course.title}</span>
                        </div>
                        <span className="text-muted-foreground shrink-0">{course.enrollments} enrolled</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
