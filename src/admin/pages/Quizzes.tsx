import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizzesApi } from '@/api/quizzes';
import type { Quiz } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const mockQuizzes: Quiz[] = [
  { _id: '1', title: 'React Basics Quiz', questions: [{ text: 'What is JSX?', optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', correctAnswer: 'A', points: 10 }], createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z' },
  { _id: '2', title: 'Node.js Quiz', questions: [{ text: 'What is Node?', optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D', correctAnswer: 'B', points: 10 }], createdAt: '2025-02-15T10:00:00Z', updatedAt: '2025-02-15T10:00:00Z' },
];

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

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
      setQuizzes(quizzes.filter((q) => q._id !== deleteId));
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
        <Button asChild><Link to="/dashboard/quizzes/new"><Plus className="mr-2 h-4 w-4" /> New Quiz</Link></Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {loading ? <TableSkeleton /> : !filtered.length ? (
            <EmptyState title="No quizzes found" description="Create your first quiz" action={<Button asChild><Link to="/dashboard/quizzes/new"><Plus className="mr-2 h-4 w-4" /> New Quiz</Link></Button>} />
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
                {filtered.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild><Link to={`/dashboard/quizzes/${quiz._id}`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(quiz._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Quiz" description="This will permanently delete this quiz and all its questions." onConfirm={handleDelete} />
    </div>
  );
};

export default Quizzes;
