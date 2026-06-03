import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layouts/MainLayout";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { api } from "@/services/api";
import type { Course } from "@/types";

const MyLearning = () => {
  const { enrolledCourses } = useEnrollmentStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses().then((all) => {
      const enrolled = all.filter((c) =>
        enrolledCourses.some((e) => e.courseId === c.id),
      );
      setCourses(enrolled);
      setLoading(false);
    });
  }, [enrolledCourses]);

  const getProgress = (courseId: string) => {
    const e = enrolledCourses.find((c) => c.courseId === courseId);
    const course = courses.find((c) => c.id === courseId);
    if (!e || !course) return 0;
    const total = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return total > 0
      ? Math.round((e.completedLessons.length / total) * 100)
      : 0;
  };

  if (loading)
    return (
      <MainLayout>
        <div className="container py-20 text-center text-muted-foreground">
          Loading...
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">My Learning</h1>
        <p className="text-muted-foreground mb-8">
          Continue where you left off
        </p>

        {courses.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">No courses yet</h3>
            <p className="text-muted-foreground">
              Enroll in a course to start learning
            </p>
            <Link to="/courses">
              <Button className="gradient-primary border-0 text-white">
                Explore Academy
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = getProgress(course.id);
              const enrollment = enrolledCourses.find(
                (e) => e.courseId === course.id,
              );
              return (
                <Card
                  key={course.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {course.instructor.name}
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {progress}% complete
                        </span>
                        {enrollment?.isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <Link to={`/learn/${course.id}`}>
                      <Button
                        size="sm"
                        className="w-full gradient-primary border-0 text-white"
                      >
                        {progress > 0 ? "Continue Learning" : "Start Learning"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyLearning;
