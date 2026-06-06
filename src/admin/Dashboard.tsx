import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsSkeleton } from '@/components/shared/SkeletonLoader';
import { analyticsApi } from '@/api/analytics';
import { Users, BookOpen, UserCheck, Layers, HelpCircle, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import type { DashboardStats } from '@/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [enrollmentGrowth, setEnrollmentGrowth] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getOverview(), analyticsApi.getUserGrowth(), analyticsApi.getEnrollmentGrowth()])
      .then(([s, ug, eg]) => { setStats(s); setUserGrowth(ug); setEnrollmentGrowth(eg); })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="space-y-6"><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><StatsSkeleton /></div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-emerald-600' },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: TrendingUp, color: 'text-violet-600' },
    { label: 'Lessons', value: stats.totalLessons, icon: Layers, color: 'text-amber-600' },
    { label: 'Quizzes', value: stats.totalQuizzes, icon: HelpCircle, color: 'text-rose-600' },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-cyan-600' },
  ];

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {userGrowth && (
          <Card>
            <CardHeader><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
            <CardContent className="h-64">
              <Line data={{ labels: userGrowth.labels, datasets: [{ label: 'Users', data: userGrowth.data, borderColor: 'hsl(222, 47%, 31%)', backgroundColor: 'hsla(222, 47%, 31%, 0.1)', fill: true, tension: 0.4 }] }} options={chartOptions} />
            </CardContent>
          </Card>
        )}
        {enrollmentGrowth && (
          <Card>
            <CardHeader><CardTitle className="text-base">Enrollment Growth</CardTitle></CardHeader>
            <CardContent className="h-64">
              <Line data={{ labels: enrollmentGrowth.labels, datasets: [{ label: 'Enrollments', data: enrollmentGrowth.data, borderColor: 'hsl(142, 50%, 35%)', backgroundColor: 'hsla(142, 50%, 35%, 0.1)', fill: true, tension: 0.4 }] }} options={chartOptions} />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Activity</TableHead><TableHead>User</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Enrolled in React Masterclass</TableCell><TableCell>Sarah Connor</TableCell><TableCell>Mar 28, 2026</TableCell></TableRow>
              <TableRow><TableCell>Completed Quiz: Node.js Basics</TableCell><TableCell>Mike Johnson</TableCell><TableCell>Mar 27, 2026</TableCell></TableRow>
              <TableRow><TableCell>New course published: Docker 101</TableCell><TableCell>Admin</TableCell><TableCell>Mar 26, 2026</TableCell></TableRow>
              <TableRow><TableCell>Enrolled in TypeScript Essentials</TableCell><TableCell>Lisa Wang</TableCell><TableCell>Mar 25, 2026</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
