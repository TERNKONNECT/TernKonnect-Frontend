import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  superAdminApi,
  type InstructorDetail as IInstructorDetail,
} from "@/api/superadmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Trophy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const InstructorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<IInstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    superAdminApi
      .getInstructorDetail(id)
      .then(setData)
      .catch(() => toast.error("Failed to load instructor details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-muted-foreground animate-pulse">Loading...</div>
    );
  if (!data) return <div className="p-8">Instructor not found</div>;

  const totalEnrollments = data.courses.reduce(
    (a, c) => a + c.totalEnrolled,
    0,
  );
  const totalCompleted = data.courses.reduce((a, c) => a + c.totalCompleted, 0);
  const avgCompletion =
    data.courses.length > 0
      ? Math.round(
          data.courses.reduce((a, c) => a + c.completionRate, 0) /
            data.courses.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/instructors")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{data.instructor.name}</h1>
          <p className="text-sm text-muted-foreground">
            {data.instructor.email}
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Joined {new Date(data.instructor.joinedAt).toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="text-2xl font-bold">{data.totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completions</p>
              <p className="text-2xl font-bold">{totalCompleted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold">{avgCompletion}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses with students */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Courses & Students</h2>

        {data.courses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              This instructor has not created any courses yet.
            </CardContent>
          </Card>
        ) : (
          data.courses.map((course) => (
            <Card key={course.id}>
              <Collapsible
                open={expandedCourse === course.id}
                onOpenChange={(open) =>
                  setExpandedCourse(open ? course.id : null)
                }
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{course.title}</p>
                          <Badge
                            variant={
                              course.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.status}
                          </Badge>
                          <Badge variant="outline">{course.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{course.totalLessons} lessons</span>
                          <span>{course.totalEnrolled} students</span>
                          <span>{course.totalCompleted} completed</span>
                          <span>{course.completionRate}% completion rate</span>
                        </div>
                      </div>
                      <div className="w-32 hidden sm:block">
                        <Progress
                          value={course.completionRate}
                          className="h-2"
                        />
                      </div>
                    </div>
                    {expandedCourse === course.id ? (
                      <ChevronUp className="h-4 w-4 ml-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-5 pb-5 border-t">
                    {course.students.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No students enrolled yet.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Enrolled</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Lessons</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Completed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {course.students.map((student) => (
                            <TableRow key={student.enrollmentId}>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">
                                    {student.user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.user.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(
                                  student.enrolledAt,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="min-w-[120px]">
                                <div className="space-y-1">
                                  <Progress
                                    value={student.progressPct}
                                    className="h-2"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {student.progressPct}%
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <span className="font-medium">
                                  {student.completedLessons}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  / {student.totalLessons}
                                </span>
                              </TableCell>
                              <TableCell>
                                {student.isCompleted ? (
                                  <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    <CheckCircle2 className="h-3 w-3" />{" "}
                                    Completed
                                  </Badge>
                                ) : student.progressPct > 0 ? (
                                  <Badge variant="secondary" className="gap-1">
                                    <TrendingUp className="h-3 w-3" /> In
                                    Progress
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-muted-foreground"
                                  >
                                    <Clock className="h-3 w-3" /> Not Started
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {student.completedAt
                                  ? new Date(
                                      student.completedAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InstructorDetail;
