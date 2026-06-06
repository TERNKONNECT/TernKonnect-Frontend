import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  enrollmentsApi,
  type CourseEnrollmentsResponse,
} from "@/api/enrollments";
import { reviewsApi, type ReviewsResponse } from "@/api/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ArrowLeft,
  Users,
  Trophy,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "students" | "reviews";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-4 w-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
      />
    ))}
  </div>
);

const CourseEnrollments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CourseEnrollmentsResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("students");

  useEffect(() => {
    if (!id) return;
    enrollmentsApi
      .getCourseEnrollments(id)
      .then(setData)
      .catch(() => toast.error("Failed to load enrollments"))
      .finally(() => setLoading(false));

    reviewsApi
      .getCourseReviews(id)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const filtered = (data?.students ?? []).filter(
    (s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase()),
  );

  const completionRate =
    data && data.totalEnrolled > 0
      ? Math.round((data.totalCompleted / data.totalEnrolled) * 100)
      : 0;

  const avgProgress =
    data && data.students.length > 0
      ? Math.round(
          data.students.reduce((acc, s) => acc + s.progressPct, 0) /
            data.students.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/courses")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {data?.course.title ?? "Course Enrollments"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Student enrollment, progress and reviews
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/dashboard/courses/${id}`}>Edit Course</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/dashboard/courses/${id}/builder`}>Build Course</Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
                <p className="text-2xl font-bold">{data.totalEnrolled}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{data.totalCompleted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {reviews?.avgRating ?? "—"}
                  {reviews && reviews.totalReviews > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      ({reviews.totalReviews})
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setTab("students")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "students"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Students ({data?.totalEnrolled ?? 0})
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews ({reviews?.totalReviews ?? 0})
        </button>
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <Card>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <TableSkeleton />
            ) : !filtered.length ? (
              <EmptyState
                title="No students enrolled"
                description="No students have enrolled yet."
              />
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
                  {filtered.map((student) => (
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
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
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
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : student.progressPct > 0 ? (
                          <Badge variant="secondary" className="gap-1">
                            <TrendingUp className="h-3 w-3" /> In Progress
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
                          ? new Date(student.completedAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews tab */}
      {tab === "reviews" && (
        <div className="space-y-4">
          {reviewsLoading ? (
            <TableSkeleton />
          ) : !reviews || reviews.reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              description="Students who complete this course can leave a review."
            />
          ) : (
            <>
              {/* Average rating summary */}
              <Card>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold">{reviews.avgRating}</p>
                    <StarRating rating={Math.round(reviews.avgRating)} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {reviews.totalReviews} review
                      {reviews.totalReviews !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.reviews.filter(
                        (r) => r.rating === star,
                      ).length;
                      const pct =
                        reviews.totalReviews > 0
                          ? Math.round((count / reviews.totalReviews) * 100)
                          : 0;
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-4 text-right">{star}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="w-8 text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Individual reviews */}
              {reviews.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage
                          src={review.User.avatar}
                          alt={review.User.name}
                        />
                        <AvatarFallback>
                          {review.User.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {review.User.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {review.User.email}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StarRating rating={review.rating} />
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollments;
