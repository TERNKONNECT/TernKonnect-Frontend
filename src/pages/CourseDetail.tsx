import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  BarChart3,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  BookOpen,
  CreditCard,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import MainLayout from "@/components/layouts/MainLayout";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types";

import { useTTS } from "@/hooks/useTTS";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUser = useAuthStore((s) => s.user);
  const { isEnrolled, enroll, getEnrolledCourse, refreshFromServer } =
    useEnrollmentStore();

  const { speak } = useTTS();
  // const voiceActive = useRef(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Read course info when loaded
  useEffect(() => {
    if (!course) return;
    // voiceActive.current = true;
    setVoiceActive(true);
    setTimeout(() => {
      const msg = enrolled
        ? `${course.title}. ${course.shortDescription}. Instructor: ${course.instructor.name}. You are already enrolled. Would you like to start learning?`
        : `${course.title}. ${course.shortDescription}. Instructor: ${course.instructor.name}. Would you like to enroll in this course?`;
      speak(msg);
    }, 800);
  }, [course]);

  useVoiceCommands(
    [
      {
        command: /(enroll|yes|sign me up)/i,
        action: async () => {
          if (enrolled) return;
          speak("Enrolling you now.");
          await handleEnroll();
          setTimeout(() => {
            speak("You are enrolled! Would you like to start learning?");
          }, 1500);
        },
      },
      {
        command: /(start learning|start|continue|begin)/i,
        action: () => {
          if (!enrolled || !course) return;
          speak("Starting your learning journey now.");
          setTimeout(() => navigate(`/learn/${course.id}`), 1000);
        },
      },
    ],
    voiceActive,
  );

  useEffect(() => {
    if (id) {
      if (isAuthenticated) refreshFromServer();
      api.getCourseById(id).then((c) => {
        setCourse(c || null);
        setLoading(false);
      });
    }
  }, [id, isAuthenticated, refreshFromServer]);

  // Fetch reviews from backend
  useEffect(() => {
    if (!id) return;
    (api as any)
      .getCourseReviews(id)
      .then((data: any) => {
        setReviews(data.reviews ?? []);
        setAvgRating(data.avgRating ?? 0);
        setTotalReviews(data.totalReviews ?? 0);
        if (
          currentUser?.id &&
          data.reviews?.some((r: any) => r.User?.id === currentUser.id)
        ) {
          setHasReviewed(true);
        }
      })
      .catch(() => {});
  }, [id, currentUser?.id]);

  const enrolled = id ? isEnrolled(id) || Boolean(course?.hasAccess) : false;
  const enrollment = id ? getEnrolledCourse(id) : undefined;
  const totalLessons =
    course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  const completedLessons = enrollment?.completedLessons.length ?? 0;
  const progressPct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hasCompleted = enrollment?.isCompleted ?? false;

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (id) {
      if (course?.hasAccess) {
        await refreshFromServer();
        navigate(`/learn/${id}`);
        return;
      }
      try {
        await enroll(id);
        await refreshFromServer();
        toast({
          title: "Enrolled!",
          description: `You've been enrolled in ${course?.title}`,
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to enroll",
          variant: "destructive",
        });
      }
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!id) return;

    setCheckingOut(true);
    try {
      const res = await api.initializePayment(id);
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (err: any) {
      if (String(err.message || "").toLowerCase().includes("already have access")) {
        await refreshFromServer();
        setCourse((current) =>
          current ? { ...current, hasAccess: true } : current,
        );
        toast({
          title: "Access confirmed",
          description: "You already have access to this course.",
        });
        navigate(`/learn/${id}`);
        return;
      }
      toast({
        title: "Checkout Failed",
        description: err.message || "Could not initialize payment.",
        variant: "destructive",
      });
      setCheckingOut(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || userRating === 0) return;
    setSubmittingReview(true);
    try {
      await (api as any).submitReview(id, userRating, userComment);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setHasReviewed(true);
      const data: any = await (api as any).getCourseReviews(id);
      setReviews(data.reviews ?? []);
      setAvgRating(data.avgRating ?? 0);
      setTotalReviews(data.totalReviews ?? 0);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId],
    );
  };

  if (loading)
    return (
      <MainLayout>
        <div className="container py-8 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-64" />
        </div>
      </MainLayout>
    );

  if (!course)
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <Button className="mt-4" onClick={() => navigate("/courses")}>
            Explore Academy
          </Button>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      {/* Hero */}
      <section className="gradient-primary text-white py-12">
        <div className="container grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0"
            >
              {course.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
            <p className="text-lg opacity-90">{course.shortDescription}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm opacity-80">
              {avgRating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {avgRating} ({totalReviews} review
                  {totalReviews !== 1 ? "s" : ""})
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {course.level}
              </span>
            </div>
            <p className="text-sm opacity-80">
              Created by{" "}
              <span className="font-medium underline">
                {course.instructor.name}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {enrolled ? (
              <Card className="bg-white text-foreground">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold">Your Progress</h3>
                  <Progress value={progressPct} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {completedLessons}/{totalLessons} lessons completed
                  </p>
                  <Button
                    className="w-full gradient-primary border-0 text-white"
                    onClick={() => navigate(`/learn/${course.id}`)}
                  >
                    {completedLessons > 0
                      ? "Continue Learning"
                      : "Start Learning"}
                  </Button>
                </CardContent>
              </Card>
            ) : course.pricingType === "paid" ? (
              <Card className="bg-white text-foreground">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">
                    {course.currency} {course.price?.toLocaleString()}
                  </h3>
                  <Button
                    className="w-full gradient-primary border-0 text-white"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkingOut}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {checkingOut ? "Processing..." : "Enroll Now"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> Secure Paystack Checkout
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white text-foreground">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <Button
                    className="w-full gradient-primary border-0 text-white"
                    size="lg"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Full lifetime access
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <div className="container py-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-10">
          {/* What You'll Learn */}
          {course.whatYouLearn.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.whatYouLearn.map((item, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Curriculum */}
          <section>
            <h2 className="text-xl font-bold mb-4">Course Curriculum</h2>
            <div className="space-y-3">
              {course.modules.map((mod) => (
                <Card key={mod.id}>
                  <button
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-lg"
                    onClick={() => toggleModule(mod.id)}
                    aria-expanded={expandedModules.includes(mod.id)}
                  >
                    <div>
                      <h3 className="font-semibold text-sm">
                        Module {mod.order}: {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {mod.lessons.length} lessons
                        {mod.quizId ? " • 1 quiz" : ""}
                      </p>
                    </div>
                    {expandedModules.includes(mod.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedModules.includes(mod.id) && (
                    <div className="px-4 pb-4 space-y-2">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 text-sm"
                        >
                          {lesson.type === "video" ? (
                            <Play className="h-4 w-4 text-muted-foreground" />
                          ) : lesson.type === "reading" ? (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </span>
                        </div>
                      ))}
                      {mod.quizId && (
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 text-sm text-primary font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Module Quiz</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-bold mb-4">
              Student Reviews
              {avgRating > 0 && (
                <span className="ml-3 text-base font-normal text-muted-foreground">
                  ⭐ {avgRating} ({totalReviews} review
                  {totalReviews !== 1 ? "s" : ""})
                </span>
              )}
            </h2>

            {/* Submit review — only for completed students who haven't reviewed yet */}
            {isAuthenticated && hasCompleted && !hasReviewed && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-5 space-y-3">
                  <p className="font-medium text-sm">
                    You completed this course! Leave a review:
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setUserRating(s)}>
                        <Star
                          className={`h-7 w-7 transition-colors ${s <= userRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Share your experience with this course..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  />
                  <Button
                    className="gradient-primary border-0 text-white"
                    onClick={handleSubmitReview}
                    disabled={submittingReview || userRating === 0}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isAuthenticated && hasReviewed && (
              <Card className="mb-6 border-emerald-200 bg-emerald-50">
                <CardContent className="p-4 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> You have already reviewed
                  this course.
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviews yet.
                  {hasCompleted ? " Be the first to review!" : ""}
                </p>
              ) : (
                reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-4 flex gap-4">
                      <img
                        src={
                          review.User?.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${review.User?.name}`
                        }
                        alt={review.User?.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {review.User?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Instructor sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="h-20 w-20 rounded-full mx-auto object-cover"
              />
              <h3 className="font-semibold">{course.instructor.name}</h3>
              {course.instructor.title && (
                <p className="text-sm text-primary">
                  {course.instructor.title}
                </p>
              )}
              {course.instructor.bio && (
                <p className="text-sm text-muted-foreground">
                  {course.instructor.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
