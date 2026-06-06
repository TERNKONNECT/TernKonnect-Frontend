import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "@/api/courses";
import type { Course } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { Plus, Search, Pencil, Trash2, Users, Layers } from "lucide-react";
import { toast } from "sonner";

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super-admin";

  const fetchCourses = () => {
    setLoading(true);
    coursesApi
      .getAll()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status ? c.status === status : true;
    return matchSearch && matchStatus;
  });

  const getCourseId = (c: Course) => c.id ?? c._id ?? "";

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await coursesApi.delete(deleteId);
      toast.success("Course deleted");
      setCourses(courses.filter((c) => getCourseId(c) !== deleteId));
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        {!isSuperAdmin && (
          <Button asChild>
            <Link to="/dashboard/courses/new">
              <Plus className="mr-2 h-4 w-4" /> New Course
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : !filtered.length ? (
            <EmptyState
              title="No courses found"
              description={
                isSuperAdmin
                  ? "No courses have been created yet."
                  : "Create your first course"
              }
              action={
                !isSuperAdmin ? (
                  <Button asChild>
                    <Link to="/dashboard/courses/new">
                      <Plus className="mr-2 h-4 w-4" /> New Course
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  {isSuperAdmin && <TableHead>Instructor</TableHead>}
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((course) => {
                  const cid = getCourseId(course);
                  return (
                    <TableRow key={cid}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {course.instructor ? (
                            <div>
                              <p className="text-sm font-medium">
                                {course.instructor.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {course.instructor.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>{course.difficulty}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="View enrollments"
                          >
                            <Link to={`/dashboard/courses/${cid}/enrollments`}>
                              <Users className="h-4 w-4 text-blue-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Build course"
                          >
                            <Link to={`/dashboard/courses/${cid}/builder`}>
                              <Layers className="h-4 w-4 text-violet-600" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Edit course"
                          >
                            <Link to={`/dashboard/courses/${cid}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(cid)}
                              title="Delete course"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Course"
        description="This will permanently delete the course and all its modules, lessons and quizzes."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Courses;
