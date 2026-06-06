import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { coursesApi } from "@/api/courses";
import { modulesApi } from "@/api/modules";
import { lessonsApi } from "@/api/lessons";
import { quizzesApi } from "@/api/quizzes";
import type { Course, Module, Lesson, Quiz, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  HelpCircle,
  Pencil,
  Check,
  X,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const VideoPreview = ({ url }: { url: string }) => {
  const embedUrl = getYoutubeEmbedUrl(url);
  return embedUrl ? (
    <iframe
      src={embedUrl}
      className="w-full rounded-lg aspect-video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <video
      src={url}
      controls
      className="w-full rounded-lg aspect-video bg-black"
    />
  );
};

// ── Inline editable text ──────────────────────────────────────────────────────
const InlineEdit = ({
  value,
  onSave,
}: {
  value: string;
  onSave: (v: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  if (!editing)
    return (
      <span
        className="cursor-pointer hover:underline"
        onClick={() => setEditing(true)}
      >
        {value}
      </span>
    );
  return (
    <span className="flex items-center gap-1">
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="h-7 text-sm w-48"
        autoFocus
      />
      <button
        onClick={() => {
          onSave(val);
          setEditing(false);
        }}
        className="text-primary"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </span>
  );
};

// ── Quiz editor ───────────────────────────────────────────────────────────────
const QuizEditor = ({
  courseId,
  moduleId,
  quiz,
  onSaved,
}: {
  courseId: string;
  moduleId: string;
  quiz: Quiz | null;
  onSaved: (q: Quiz) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(quiz?.title ?? "Module Quiz");
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions ?? [
      { text: "", options: ["", "", "", ""], correctIndex: 0 },
    ],
  );
  const [saving, setSaving] = useState(false);

  const updateQ = (i: number, updates: Partial<Question>) =>
    setQuestions(
      questions.map((q, idx) => (idx === i ? { ...q, ...updates } : q)),
    );

  const updateOption = (qi: number, oi: number, val: string) => {
    const opts = [...questions[qi].options];
    opts[oi] = val;
    updateQ(qi, { options: opts });
  };

  const handleSave = async () => {
    if (questions.some((q) => !q.text.trim()))
      return toast.error("All questions need text");
    setSaving(true);
    try {
      const payload = { title, description: "", questions };
      const saved = quiz
        ? await quizzesApi.update(courseId, moduleId, payload)
        : await quizzesApi.create(courseId, moduleId, payload);
      onSaved(saved);
      setOpen(false);
      toast.success(quiz ? "Quiz updated" : "Quiz created");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <HelpCircle className="h-4 w-4" />
          {quiz ? "Edit Quiz" : "Add Quiz"}
        </button>
      ) : (
        <Card className="border-primary/30 mt-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Quiz Editor</CardTitle>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <Input
              placeholder="Quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Question {qi + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() =>
                        setQuestions(questions.filter((_, i) => i !== qi))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Question text"
                  value={q.text}
                  onChange={(e) => updateQ(qi, { text: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => updateQ(qi, { correctIndex: oi })}
                        className="accent-primary"
                      />
                      <Input
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the radio button next to the correct answer
                </p>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                setQuestions([
                  ...questions,
                  { text: "", options: ["", "", "", ""], correctIndex: 0 },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
            </Button>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Quiz"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ── Add Lesson form ───────────────────────────────────────────────────────────
// const AddLessonForm = ({
//   courseId,
//   moduleId,
//   order,
//   onAdded,
//   onCancel,
// }: {
//   courseId: string;
//   moduleId: string;
//   order: number;
//   onAdded: (l: Lesson) => void;
//   onCancel: () => void;
// }) => {
//   const [type, setType] = useState<"video" | "text">("video");
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [duration, setDuration] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);

//   const handleSave = async () => {
//     if (!title.trim()) return toast.error("Title is required");
//     setSaving(true);
//     setUploadProgress(0);
//     try {
//       let lesson: Lesson;
//       if (type === "text") {
//         lesson = await lessonsApi.createText(courseId, moduleId, {
//           title,
//           content,
//           order,
//         });
//       } else {
//         if (!file) return toast.error("Please select a video file");
//         lesson = await lessonsApi.createVideo(
//           courseId,
//           moduleId,
//           file,
//           title,
//           duration,
//           order,
//           (pct) => setUploadProgress(pct),
//         );
//       }
//       onAdded(lesson);
//       toast.success("Lesson added");
//     } catch (err: any) {
//       toast.error(
//         err.response?.data?.error || err.message || "Failed to add lesson",
//       );
//     } finally {
//       setSaving(false);
//       setUploadProgress(0);
//     }
//   };

//   return (
//     <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
//       <div className="flex gap-2">
//         <button
//           onClick={() => setType("video")}
//           className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === "video" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
//         >
//           <Play className="h-3 w-3" /> Video
//         </button>
//         <button
//           onClick={() => setType("text")}
//           className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === "text" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
//         >
//           <FileText className="h-3 w-3" /> Text
//         </button>
//       </div>
//       <Input
//         placeholder="Lesson title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />
//       {type === "text" ? (
//         <Textarea
//           placeholder="Lesson content..."
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           rows={4}
//         />
//       ) : (
//         <div className="space-y-2">
//           <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted transition-colors">
//             <Upload className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm text-muted-foreground">
//               {file ? file.name : "Choose video file (mp4, mov, webm)"}
//             </span>
//             <input
//               type="file"
//               accept="video/*"
//               className="hidden"
//               onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//             />
//           </label>
//           <Input
//             placeholder="Duration (e.g. 15 min)"
//             value={duration}
//             onChange={(e) => setDuration(e.target.value)}
//           />
//           {saving && uploadProgress > 0 && (
//             <div className="space-y-1">
//               <div className="w-full bg-muted rounded-full h-2">
//                 <div
//                   className="bg-primary h-2 rounded-full transition-all"
//                   style={{ width: `${uploadProgress}%` }}
//                 />
//               </div>
//               <p className="text-xs text-muted-foreground text-center">
//                 {uploadProgress < 100
//                   ? `Uploading... ${uploadProgress}%`
//                   : "Saving lesson..."}
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//       <div className="flex gap-2">
//         <Button size="sm" onClick={handleSave} disabled={saving}>
//           {saving
//             ? type === "video"
//               ? "Uploading..."
//               : "Adding..."
//             : "Add Lesson"}
//         </Button>
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={onCancel}
//           disabled={saving}
//         >
//           Cancel
//         </Button>
//       </div>
//     </div>
//   );
// };

const AddLessonForm = ({
  courseId,
  moduleId,
  order,
  onAdded,
  onCancel,
}: {
  courseId: string;
  moduleId: string;
  order: number;
  onAdded: (l: Lesson) => void;
  onCancel: () => void;
}) => {
  const [type, setType] = useState<"video" | "text">("video");
  const [videoMode, setVideoMode] = useState<"upload" | "youtube">("upload");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [introMode, setIntroMode] = useState<"upload" | "youtube">("upload");
  const [introYoutubeUrl, setIntroYoutubeUrl] = useState("");

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    setSaving(true);
    setUploadProgress(0);
    try {
      let lesson: Lesson;
      if (type === "text") {
        lesson = await lessonsApi.createText(courseId, moduleId, {
          title,
          content,
          order,
        });
      } else if (videoMode === "youtube") {
        if (!youtubeUrl.trim())
          return toast.error("Please enter a YouTube URL");
        lesson = await lessonsApi.createYoutube(courseId, moduleId, {
          title,
          videoUrl: youtubeUrl,
          duration,
          order,
        });
      } else {
        if (!file) return toast.error("Please select a video file");
        lesson = await lessonsApi.createVideo(
          courseId,
          moduleId,
          file,
          title,
          duration,
          order,
          (pct) => setUploadProgress(pct),
        );
      }
      onAdded(lesson);
      toast.success("Lesson added");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.message || "Failed to add lesson",
      );
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="flex gap-2">
        <button
          onClick={() => setType("video")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === "video" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
        >
          <Play className="h-3 w-3" /> Video
        </button>
        <button
          onClick={() => setType("text")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${type === "text" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
        >
          <FileText className="h-3 w-3" /> Text
        </button>
      </div>
      <Input
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {type === "text" ? (
        <Textarea
          placeholder="Lesson content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setVideoMode("upload")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${videoMode === "upload" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              <Upload className="h-3 w-3" /> Upload File
            </button>
            <button
              onClick={() => setVideoMode("youtube")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${videoMode === "youtube" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              YouTube Link
            </button>
          </div>
          {videoMode === "upload" ? (
            <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : "Choose video file (mp4, mov, webm)"}
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          )}
          <Input
            placeholder="Duration (e.g. 15 min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          {saving && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {uploadProgress < 100
                  ? `Uploading... ${uploadProgress}%`
                  : "Saving lesson..."}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving
            ? type === "video" && videoMode === "upload"
              ? "Uploading..."
              : "Adding..."
            : "Add Lesson"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

// ── Module card ───────────────────────────────────────────────────────────────
const ModuleCard = ({
  mod,
  courseId,
  onDelete,
  onUpdate,
}: {
  mod: Module;
  courseId: string;
  onDelete: () => void;
  onUpdate: (m: Module) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const [addingLesson, setAddingLesson] = useState(false);
  const [deleteLesson, setDeleteLesson] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(mod.quiz ?? null);
  const [lessons, setLessons] = useState<Lesson[]>(mod.lessons ?? []);

  const handleDeleteLesson = async () => {
    if (!deleteLesson) return;
    try {
      await lessonsApi.delete(courseId, mod.id, deleteLesson);
      setLessons(lessons.filter((l) => l.id !== deleteLesson));
      toast.success("Lesson deleted");
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setDeleteLesson(null);
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Module header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <InlineEdit
            value={mod.title}
            onSave={async (title) => {
              try {
                const updated = await modulesApi.update(courseId, mod.id, {
                  title,
                });
                onUpdate({ ...mod, title: updated.title });
                toast.success("Module renamed");
              } catch {
                toast.error("Failed to rename module");
              }
            }}
          />
          <Badge variant="outline" className="text-xs">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <button
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-2">
          {/* Lessons list */}
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex items-center gap-2">
                {lesson.type === "video" ? (
                  <Play className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-sm">{lesson.title}</span>
                {lesson.duration && (
                  <span className="text-xs text-muted-foreground">
                    {lesson.duration}
                  </span>
                )}
                <Badge variant="secondary" className="text-xs">
                  {lesson.type}
                </Badge>
              </div>
              <button
                onClick={() => setDeleteLesson(lesson.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Add lesson */}
          {addingLesson ? (
            <AddLessonForm
              courseId={courseId}
              moduleId={mod.id}
              order={lessons.length + 1}
              onAdded={(l) => {
                setLessons([...lessons, l]);
                setAddingLesson(false);
              }}
              onCancel={() => setAddingLesson(false)}
            />
          ) : (
            <button
              onClick={() => setAddingLesson(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Lesson
            </button>
          )}

          {/* Quiz */}
          <div className="pt-2 border-t mt-2">
            <QuizEditor
              courseId={courseId}
              moduleId={mod.id}
              quiz={quiz}
              onSaved={setQuiz}
            />
            {quiz && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {quiz.questions.length} question
                {quiz.questions.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteLesson}
        onOpenChange={() => setDeleteLesson(null)}
        title="Delete Lesson"
        description="This will permanently delete this lesson."
        onConfirm={handleDeleteLesson}
      />
    </div>
  );
};

// ── Main CourseBuilder page ───────────────────────────────────────────────────
const CourseBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [introFile, setIntroFile] = useState<File | null>(null);
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [introMode, setIntroMode] = useState<"upload" | "youtube">("upload");
  const [introYoutubeUrl, setIntroYoutubeUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    coursesApi
      .getById(id)
      .then((c) => {
        setCourse(c);
        setModules(c.modules ?? []);
      })
      .catch(() => toast.error("Course not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !id) return;
    try {
      const mod = await modulesApi.create(id, {
        title: newModuleTitle,
        order: modules.length + 1,
      });
      setModules([...modules, { ...mod, lessons: [], quiz: null }]);
      setNewModuleTitle("");
      setAddingModule(false);
      toast.success("Module added");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add module");
    }
  };

  const handleDeleteModule = async () => {
    if (!deleteModuleId || !id) return;
    try {
      await modulesApi.delete(id, deleteModuleId);
      setModules(modules.filter((m) => m.id !== deleteModuleId));
      toast.success("Module deleted");
    } catch {
      toast.error("Failed to delete module");
    } finally {
      setDeleteModuleId(null);
    }
  };

  // const handleUploadIntroVideo = async () => {
  //   if (!introFile || !id) return;
  //   setUploadingIntro(true);
  //   try {
  //     const updated = await coursesApi.uploadIntroVideo(id, introFile); // ✅ pass File directly
  //     setCourse(updated);
  //     setIntroFile(null);
  //     toast.success("Intro video uploaded");
  //   } catch (err: any) {
  //     toast.error(err.message || "Upload failed");
  //   } finally {
  //     setUploadingIntro(false);
  //   }
  // };

  const handleUploadIntroVideo = async () => {
    if (!id) return;
    setUploadingIntro(true);
    try {
      let updated: Course;
      if (introMode === "youtube") {
        if (!introYoutubeUrl.trim())
          return toast.error("Please enter a YouTube URL");
        updated = await coursesApi.saveIntroVideoUrl(id, introYoutubeUrl);
        setIntroYoutubeUrl("");
      } else {
        if (!introFile) return toast.error("Please select a file");
        updated = await coursesApi.uploadIntroVideo(id, introFile);
        setIntroFile(null);
      }
      setCourse(updated);
      toast.success("Intro video saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save intro video");
    } finally {
      setUploadingIntro(false);
    }
  };

  if (loading)
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!course) return <div className="p-8">Course not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/dashboard/courses/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-muted-foreground">Course Builder</p>
        </div>
        <Badge
          variant={course.status === "published" ? "default" : "secondary"}
          className="ml-auto"
        >
          {course.status}
        </Badge>
      </div>

      {/* Intro video */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4 text-primary" /> Intro Video
          </CardTitle>
        </CardHeader>
        {/* <CardContent className="space-y-3">
          {course.introVideoUrl && (
            <video
              src={course.introVideoUrl}
              controls
              className="w-full rounded-lg aspect-video bg-black"
            />
          )}
          <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted transition-colors">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {introFile
                ? introFile.name
                : course.introVideoUrl
                  ? "Replace intro video"
                  : "Upload intro video"}
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setIntroFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {introFile && (
            <Button
              size="sm"
              onClick={handleUploadIntroVideo}
              disabled={uploadingIntro}
            >
              {uploadingIntro ? "Uploading..." : "Upload"}
            </Button>
          )}
        </CardContent> */}

        {/* <CardContent className="space-y-3">
          {course.introVideoUrl && (
            <video
              src={course.introVideoUrl}
              controls
              className="w-full rounded-lg aspect-video bg-black"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setIntroMode("upload")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${introMode === "upload" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              <Upload className="h-3 w-3" /> Upload File
            </button>
            <button
              onClick={() => setIntroMode("youtube")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${introMode === "youtube" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              YouTube Link
            </button>
          </div>
          {introMode === "upload" ? (
            <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-muted transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {introFile
                  ? introFile.name
                  : course.introVideoUrl
                    ? "Replace intro video"
                    : "Upload intro video"}
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => setIntroFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={introYoutubeUrl}
              onChange={(e) => setIntroYoutubeUrl(e.target.value)}
            />
          )}
          {(introFile || introYoutubeUrl) && (
            <Button
              size="sm"
              onClick={handleUploadIntroVideo}
              disabled={uploadingIntro}
            >
              {uploadingIntro ? "Saving..." : "Save"}
            </Button>
          )}
        </CardContent> */}

        {course.introVideoUrl && <VideoPreview url={course.introVideoUrl} />}
      </Card>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Modules</h2>
          <Button
            size="sm"
            onClick={() => setAddingModule(true)}
            disabled={addingModule}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Module
          </Button>
        </div>

        {modules.length === 0 && !addingModule && (
          <div className="text-center py-10 border rounded-xl text-muted-foreground text-sm">
            No modules yet. Add your first module to get started.
          </div>
        )}

        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            mod={mod}
            courseId={id!}
            onDelete={() => setDeleteModuleId(mod.id)}
            onUpdate={(updated) =>
              setModules(
                modules.map((m) =>
                  m.id === mod.id ? { ...m, ...updated } : m,
                ),
              )
            }
          />
        ))}

        {/* Add module form */}
        {addingModule && (
          <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">New Module</p>
            <Input
              placeholder="Module title (e.g. Python for Data Science)"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddModule}>
                Add Module
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAddingModule(false);
                  setNewModuleTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteModuleId}
        onOpenChange={() => setDeleteModuleId(null)}
        title="Delete Module"
        description="This will permanently delete this module and all its lessons and quiz."
        onConfirm={handleDeleteModule}
      />
    </div>
  );
};

export default CourseBuilder;
