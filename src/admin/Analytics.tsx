import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsSkeleton } from '@/components/shared/SkeletonLoader';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [completion, setCompletion] = useState<{ completed: number; inProgress: number; notStarted: number } | null>(null);
  const [quizSuccess, setQuizSuccess] = useState<{ labels: string[]; passed: number[]; failed: number[] } | null>(null);
  const [popular, setPopular] = useState<{ title: string; enrollments: number }[]>([]);

  useEffect(() => {
    Promise.all([
      analyticsApi.getUserGrowth(),
      analyticsApi.getCourseCompletion(),
      analyticsApi.getQuizSuccess(),
      analyticsApi.getPopularCourses(),
    ]).then(([ug, cc, qs, pc]) => {
      setUserGrowth(ug); setCompletion(cc); setQuizSuccess(qs); setPopular(pc);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold text-foreground">Analytics</h1><StatsSkeleton count={4} /></div>;

  const chartOpts = { responsive: true, maintainAspectRatio: false };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {userGrowth && (
          <Card>
            <CardHeader><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
            <CardContent className="h-64">
              <Line options={chartOpts} data={{ labels: userGrowth.labels, datasets: [{ label: 'Users', data: userGrowth.data, borderColor: 'hsl(222, 47%, 31%)', backgroundColor: 'hsla(222, 47%, 31%, 0.1)', fill: true, tension: 0.4 }] }} />
            </CardContent>
          </Card>
        )}

        {completion && (
          <Card>
            <CardHeader><CardTitle className="text-base">Course Completion</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut data={{ labels: ['Completed', 'In Progress', 'Not Started'], datasets: [{ data: [completion.completed, completion.inProgress, completion.notStarted], backgroundColor: ['hsl(142, 50%, 35%)', 'hsl(45, 90%, 50%)', 'hsl(0, 0%, 80%)'] }] }} options={{ ...chartOpts, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </CardContent>
          </Card>
        )}

        {quizSuccess && (
          <Card>
            <CardHeader><CardTitle className="text-base">Quiz Success Rate</CardTitle></CardHeader>
            <CardContent className="h-64">
              <Bar options={{ ...chartOpts, scales: { x: { stacked: true }, y: { stacked: true } } }} data={{ labels: quizSuccess.labels, datasets: [{ label: 'Passed', data: quizSuccess.passed, backgroundColor: 'hsl(142, 50%, 35%)' }, { label: 'Failed', data: quizSuccess.failed, backgroundColor: 'hsl(0, 84%, 60%)' }] }} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-base">Most Popular Courses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popular.map((course, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{idx + 1}</span>
                    <span className="text-sm font-medium text-foreground">{course.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{course.enrollments} enrolled</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
