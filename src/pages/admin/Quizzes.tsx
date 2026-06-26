import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quizzesApi } from '@/api/quizzes';
import type { AdminQuiz } from '@/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Plus, Search, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const mockQuizzes: AdminQuiz[] = [
  {
    _id: '1',
    moduleId: 'mock-module-1',
    title: 'React Basics Quiz',
    questions: [{ text: 'What is JSX?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, type: 'mcq' }],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    _id: '2',
    moduleId: 'mock-module-2',
    title: 'Node.js Quiz',
    questions: [{ text: 'What is Node?', options: ['A', 'B', 'C', 'D'], correctIndex: 1, type: 'mcq' }],
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-02-15T10:00:00Z',
  },
];

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const navigate = useNavigate();

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizzesApi.getAll();
      setQuizzes(data);
    } catch {
      setQuizzes(mockQuizzes);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const filtered = quizzes.filter((q) => q.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      if (!useMock) await quizzesApi.delete(deleteId);
      setQuizzes(quizzes.filter((q) => (q._id ?? q.id) !== deleteId));
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    }
    setDeleteId(null);
  };

  const getQuizId = (quiz: AdminQuiz) => quiz._id ?? quiz.id ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
        <Button onClick={() => navigate('/dashboard/courses')}>
          <ExternalLink className="mr-2 h-4 w-4" /> Manage via Course Builder
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {loading ? <TableSkeleton /> : !filtered.length ? (
            <EmptyState
              title="No quizzes found"
              description="Create quizzes inside the Course Builder under each module."
              action={
                <Button asChild>
                  <Link to="/dashboard/courses"><Plus className="mr-2 h-4 w-4" /> Go to Courses</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((quiz) => {
                  const qId = getQuizId(quiz);
                  return (
                    <TableRow key={qId}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</TableCell>
                      <TableCell>{quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => toast.info('Edit quizzes via the Course Builder')}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(qId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        title="Delete Quiz"
        description="This will permanently delete this quiz and all its questions."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Quizzes;
