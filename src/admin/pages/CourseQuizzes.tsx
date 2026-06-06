import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizzesApi } from "@/api/quizzes";
import type { Quiz, Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

const emptyQuestion = (): Question => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});
const emptyQuizForm = {
  title: "",
  description: "",
  questions: [emptyQuestion()],
};

const QuizFormPanel = ({
  title,
  setTitle,
  description,
  setDescription,
  questions,
  setQuestions,
  onSave,
  onCancel,
  saving,
  submitLabel,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) => {
  const updateQ = (i: number, updates: Partial<Question>) =>
    setQuestions(
      questions.map((q, idx) => (idx === i ? { ...q, ...updates } : q)),
    );

  const updateOption = (qi: number, oi: number, val: string) => {
    const opts = [...questions[qi].options];
    opts[oi] = val;
    updateQ(qi, { options: opts });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Quiz title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {questions.map((q, i) => (
        <Card key={i} className="border-dashed">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Question {i + 1}
              </span>
              {questions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuestions(questions.filter((_, idx) => idx !== i))
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Question text"
              value={q.text}
              onChange={(e) => updateQ(i, { text: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <Input
                  key={oi}
                  placeholder={`Option ${oi + 1}`}
                  value={opt}
                  onChange={(e) => updateOption(i, oi, e.target.value)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Correct answer:
              </span>
              <div className="flex gap-1">
                {q.options.map((_, oi) => (
                  <Button
                    key={oi}
                    size="sm"
                    variant={q.correctIndex === oi ? "default" : "outline"}
                    onClick={() => updateQ(i, { correctIndex: oi })}
                    className="w-8 h-8 p-0"
                  >
                    {oi + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setQuestions([...questions, emptyQuestion()])}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
      <div className="flex gap-2">
        <Button onClick={onSave} disabled={saving}>
          <Check className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : submitLabel}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
};

const CourseQuizzes = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addQuestions, setAddQuestions] = useState<Question[]>([
    emptyQuestion(),
  ]);

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!courseId) return;
    quizzesApi
      .getAll(courseId)
      .then(setQuizzes)
      .catch(() => toast.error("Failed to load quizzes"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAdd = async () => {
    if (!courseId || !addTitle.trim())
      return toast.error("Quiz title is required");
    if (addQuestions.some((q) => !q.text.trim()))
      return toast.error("All questions need text");
    setSaving(true);
    try {
      const quiz = await quizzesApi.create(courseId, {
        title: addTitle,
        description: addDesc,
        questions: addQuestions,
      });
      setQuizzes([quiz, ...quizzes]);
      setAddTitle("");
      setAddDesc("");
      setAddQuestions([emptyQuestion()]);
      setShowAdd(false);
      toast.success("Quiz created");
    } catch {
      toast.error("Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!courseId || !editId || !editTitle.trim())
      return toast.error("Quiz title is required");
    if (editQuestions.some((q) => !q.text.trim()))
      return toast.error("All questions need text");
    setSaving(true);
    try {
      const updated = await quizzesApi.update(courseId, editId, {
        title: editTitle,
        description: editDesc,
        questions: editQuestions,
      });
      setQuizzes(quizzes.map((q) => (q._id === editId ? updated : q)));
      setEditId(null);
      toast.success("Quiz updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId || !deleteId) return;
    try {
      await quizzesApi.delete(courseId, deleteId);
      setQuizzes(quizzes.filter((q) => q._id !== deleteId));
      toast.success("Quiz deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (quiz: Quiz) => {
    setEditId(quiz._id);
    setEditTitle(quiz.title);
    setEditDesc(quiz.description);
    setEditQuestions(
      quiz.questions.length ? quiz.questions : [emptyQuestion()],
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
        </div>
        <Button
          onClick={() => {
            setShowAdd(true);
            setEditId(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Quiz
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizFormPanel
              title={addTitle}
              setTitle={setAddTitle}
              description={addDesc}
              setDescription={setAddDesc}
              questions={addQuestions}
              setQuestions={setAddQuestions}
              onSave={handleAdd}
              onCancel={() => {
                setShowAdd(false);
                setAddTitle("");
                setAddDesc("");
                setAddQuestions([emptyQuestion()]);
              }}
              saving={saving}
              submitLabel="Create Quiz"
            />
          </CardContent>
        </Card>
      )}

      {loading ? null : !quizzes.length ? (
        <EmptyState
          title="No quizzes yet"
          description="Create the first quiz for this course"
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Quiz
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card key={quiz._id}>
              <CardContent className="p-4">
                {editId === quiz._id ? (
                  <>
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Editing: {quiz.title}
                    </p>
                    <QuizFormPanel
                      title={editTitle}
                      setTitle={setEditTitle}
                      description={editDesc}
                      setDescription={setEditDesc}
                      questions={editQuestions}
                      setQuestions={setEditQuestions}
                      onSave={handleEdit}
                      onCancel={() => setEditId(null)}
                      saving={saving}
                      submitLabel="Save Changes"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{quiz.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questions.length} question
                        {quiz.questions.length !== 1 ? "s" : ""}
                        {quiz.description && ` · ${quiz.description}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(quiz)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(quiz._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Quiz"
        description="This quiz and all its questions will be permanently removed."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CourseQuizzes;
