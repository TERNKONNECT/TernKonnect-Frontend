import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Calendar, BookOpen, Award, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { api } from "@/services/api";
import type { Course } from "@/types";

const achievements = [
  {
    icon: BookOpen,
    label: "First Course",
    desc: "Enrolled in your first course",
  },
  {
    icon: Award,
    label: "Quick Learner",
    desc: "Completed a lesson within 24h",
  },
  { icon: Trophy, label: "Quiz Master", desc: "Scored 100% on a quiz" },
];

const Profile = () => {
  const { user } = useAuthStore();
  const { enrolledCourses } = useEnrollmentStore();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.getCourses().then((all) => {
      setCourses(
        all.filter((c) => enrolledCourses.some((e) => e.courseId === c.id)),
      );
    });
  }, [enrolledCourses]);

  const completedCourses = enrolledCourses.filter((e) => e.isCompleted);

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-24 w-24 rounded-full"
            />
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user?.joinedAt || "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4 text-sm pt-1">
                <span>
                  <strong>{enrolledCourses.length}</strong> Enrolled
                </span>
                <span>
                  <strong>{completedCourses.length}</strong> Completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Enrolled Courses</h2>
            {courses.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No courses enrolled yet.{" "}
                  <Link to="/courses" className="text-primary hover:underline">
                    Academy
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const e = enrolledCourses.find(
                    (en) => en.courseId === course.id,
                  );
                  const total = course.modules.reduce(
                    (acc, m) => acc + m.lessons.length,
                    0,
                  );
                  const pct =
                    total > 0
                      ? Math.round(
                          ((e?.completedLessons.length || 0) / total) * 100,
                        )
                      : 0;
                  return (
                    <Link key={course.id} to={`/learn/${course.id}`}>
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-14 w-20 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {pct}%
                              </span>
                              {e?.isCompleted && (
                                <Badge variant="secondary" className="text-xs">
                                  Done
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Achievements</h2>
            <div className="space-y-3">
              {achievements.map((a, i) => {
                const unlocked = i === 0 && enrolledCourses.length > 0;
                return (
                  <Card key={i} className={!unlocked ? "opacity-50" : ""}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${unlocked ? "gradient-primary" : "bg-muted"}`}
                      >
                        <a.icon
                          className={`h-5 w-5 ${unlocked ? "text-white" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">{a.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {a.desc}
                        </p>
                      </div>
                      {unlocked && <Badge className="ml-auto">Unlocked</Badge>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
