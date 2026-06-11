import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { coursesApi } from "@/api/courses";
import type { Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CardSkeleton } from "@/components/shared/SkeletonLoader";
import { toast } from "sonner";
import { ArrowLeft, Layers, Trash2, Plus, X, Upload } from "lucide-react";
import api from "@/api/axios";

const courseSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  difficulty: z.string().min(1),
  status: z.enum(["draft", "published"]),
  pricingType: z.enum(["free", "paid"]),
  price: z.coerce.number().min(0),
}).refine((data) => data.pricingType === "free" || data.price > 0, {
  message: "Paid courses need a price",
  path: ["price"],
});

type CourseFormData = z.infer<typeof courseSchema>;

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>([]);
  const [newPoint, setNewPoint] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const form = useForm<CourseFormData>({ resolver: zodResolver(courseSchema) });
  const pricingType = form.watch("pricingType");

  useEffect(() => {
    if (!id) return;
    coursesApi
      .getById(id)
      .then((c) => {
        setCourse(c);
        setWhatYouLearn((c as any).whatYouLearn ?? []);
        form.reset({
          title: c.title,
          description: c.description,
          difficulty: c.difficulty || "Beginner",
          status: c.status,
          pricingType: (c as any).pricingType ?? "free",
          price: Number((c as any).price || 0),
        });
      })
      .catch(() => toast.error("Course not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: CourseFormData) => {
    if (!id) return;
    setSaving(true);
    try {
      await coursesApi.update(id, { ...data, whatYouLearn } as any);
      toast.success("Course updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await coursesApi.delete(id);
    toast.success("Course deleted");
    navigate("/dashboard/courses");
  };

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    setWhatYouLearn([...whatYouLearn, newPoint.trim()]);
    setNewPoint("");
  };

  const handleUploadThumbnail = async () => {
    if (!thumbnailFile || !id) return;
    setUploadingThumb(true);
    setThumbProgress(0);
    try {
      const updated = await coursesApi.uploadThumbnail(
        id,
        thumbnailFile,
        (pct) => setThumbProgress(pct),
      );
      setCourse(updated);
      setThumbnailFile(null);
      setThumbProgress(0);
      toast.success("Thumbnail uploaded");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload thumbnail");
    } finally {
      setUploadingThumb(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/courses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/dashboard/courses/${id}/builder`}>
              <Layers className="mr-2 h-4 w-4" /> Build Course
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thumbnail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Thumbnail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {course?.thumbnail && (
            <img
              src={course.thumbnail}
              alt="thumbnail"
              className="w-full aspect-video object-cover rounded-lg"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {thumbnailFile
                ? thumbnailFile.name
                : course?.thumbnail
                  ? "Replace thumbnail"
                  : "Upload thumbnail image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {/* {thumbnailFile && (
            <Button
              size="sm"
              onClick={handleUploadThumbnail}
              disabled={uploadingThumb}
            >
              {uploadingThumb ? "Uploading..." : "Upload"}
            </Button>
          )} */}

          {thumbnailFile && (
            <div className="space-y-2">
              {uploadingThumb && (
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${thumbProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {thumbProgress < 100 ? `${thumbProgress}%` : "Saving..."}
                  </p>
                </div>
              )}
              <Button
                size="sm"
                onClick={handleUploadThumbnail}
                disabled={uploadingThumb}
              >
                {uploadingThumb ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course details form */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "free") form.setValue("price", 0);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (NGN)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          disabled={pricingType === "free"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/courses")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* What You'll Learn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What You'll Learn</CardTitle>
          <p className="text-xs text-muted-foreground">
            Add bullet points shown to students on the course page
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {whatYouLearn.map((point, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 text-sm border rounded-lg px-3 py-2 bg-muted/30">
                {point}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setWhatYouLearn(whatYouLearn.filter((_, idx) => idx !== i))
                }
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Build real-world projects with React"
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddPoint())
              }
            />
            <Button type="button" variant="outline" onClick={handleAddPoint}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {whatYouLearn.length > 0 && (
            <Button size="sm" onClick={() => form.handleSubmit(onSubmit)()}>
              Save Learning Points
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Course"
        description="This will permanently delete this course and all its modules, lessons and quizzes."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CourseDetail;
