import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizzesApi } from '@/api/quizzes';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyQuestion = (): Question => ({ text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', points: 10 });

const QuizNew = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...updates } : q)));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('Quiz title is required');
    if (questions.some((q) => !q.text.trim())) return toast.error('All questions need text');
    setLoading(true);
    try {
      await quizzesApi.create({ title, questions });
      toast.success('Quiz created!');
      navigate('/dashboard/quizzes');
    } catch {
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/quizzes')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-foreground">New Quiz</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Quiz Details</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-6" />

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={idx} className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    )}
                  </div>
                  <Input placeholder="Question text" value={q.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Option A" value={q.optionA} onChange={(e) => updateQuestion(idx, { optionA: e.target.value })} />
                    <Input placeholder="Option B" value={q.optionB} onChange={(e) => updateQuestion(idx, { optionB: e.target.value })} />
                    <Input placeholder="Option C" value={q.optionC} onChange={(e) => updateQuestion(idx, { optionC: e.target.value })} />
                    <Input placeholder="Option D" value={q.optionD} onChange={(e) => updateQuestion(idx, { optionD: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={q.correctAnswer} onValueChange={(v) => updateQuestion(idx, { correctAnswer: v as Question['correctAnswer'] })}>
                      <SelectTrigger><SelectValue placeholder="Correct answer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Points" value={q.points} onChange={(e) => updateQuestion(idx, { points: parseInt(e.target.value) || 0 })} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={() => setQuestions([...questions, emptyQuestion()])}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Creating...' : 'Create Quiz'}</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/quizzes')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizNew;
