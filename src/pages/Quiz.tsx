import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "@/hooks/useTTS";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import type { Quiz as QuizType } from "@/types";

const isAnswered = (
  q: { id: string; type?: "mcq" | "theory" },
  answers: Record<string, number | string>,
) => {
  const a = answers[q.id];
  if (q.type === "theory") return typeof a === "string" && a.trim().length > 0;
  return a !== undefined;
};

const Quiz = () => {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number | string>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useTTS();
  const { addQuizAttempt, completeCourse } = useEnrollmentStore();

  // Refs so voice callbacks always have latest state
  const quizRef = useRef<QuizType | null>(null);
  const currentQuestionRef = useRef(0);
  const selectedAnswersRef = useRef<Record<string, number | string>>({});
  const submittedRef = useRef(false);

  useEffect(() => {
    quizRef.current = quiz;
  }, [quiz]);
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);
  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  useEffect(() => {
    if (quizId)
      api.getQuiz(quizId).then((q) => {
        setQuiz(q || null);
        setLoading(false);
      });
  }, [quizId]);

  // Read question aloud when it changes
  useEffect(() => {
    if (!quiz) return;
    const q = quiz.questions[currentQuestion];
    if (!q) return;
    setTimeout(() => {
      if (q.type === "theory") {
        speak(
          `Question ${currentQuestion + 1} of ${quiz.questions.length}. ${q.question}. This is a written answer question — please type your response.`,
        );
        return;
      }
      const optionsText = q.options
        .map((opt, i) => `Option ${i + 1}: ${opt}`)
        .join(". ");
      speak(
        `Question ${currentQuestion + 1} of ${quiz.questions.length}. ${q.question}. ${optionsText}. Say select option 1 through ${q.options.length} to answer.`,
      );
    }, 400);
  }, [currentQuestion, quiz]);

  const handleSelectAnswer = (optionIndex: number) => {
    if (submitted) return;
    const q = quiz!.questions[currentQuestion];
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    selectedAnswersRef.current = {
      ...selectedAnswersRef.current,
      [q.id]: optionIndex,
    };
    speak(`Selected option ${optionIndex + 1}: ${q.options[optionIndex]}`);
  };

  const handleTheoryAnswer = (value: string) => {
    if (submitted) return;
    const q = quiz!.questions[currentQuestion];
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: value }));
    selectedAnswersRef.current = {
      ...selectedAnswersRef.current,
      [q.id]: value,
    };
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;
    const gradable = quiz.questions.filter((q) => q.type !== "theory");
    const score = gradable.reduce(
      (acc, q) =>
        acc + (selectedAnswersRef.current[q.id] === q.correctAnswer ? 1 : 0),
      0,
    );
    if (courseId && quizId) {
      addQuizAttempt(courseId, {
        quizId,
        answers: selectedAnswersRef.current,
        score,
        totalQuestions: gradable.length,
        completedAt: new Date().toISOString(),
      });
      if (gradable.length === 0 || score === gradable.length)
        completeCourse(courseId);
    }
    setSubmitted(true);
    speak(
      gradable.length > 0
        ? `Quiz submitted. Your score is ${score} out of ${gradable.length}.`
        : "Quiz submitted. Your answers have been saved for review.",
    );
    toast({
      title: "Quiz Submitted!",
      description:
        gradable.length > 0
          ? `You scored ${score}/${gradable.length}`
          : "Your answers have been saved for review.",
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    selectedAnswersRef.current = {};
    setCurrentQuestion(0);
    setSubmitted(false);
    speak("Quiz restarted. Good luck!");
  };

  // Voice command handlers
  // const handleVoiceSelect = useCallback(
  //   (option: string) => {
  //     if (submittedRef.current || !quizRef.current) return;
  //     const map: Record<string, number> = {
  //       one: 0,
  //       "1": 0,
  //       first: 0,
  //       two: 1,
  //       "2": 1,
  //       second: 1,
  //       three: 2,
  //       "3": 2,
  //       third: 2,
  //       four: 3,
  //       "4": 3,
  //       fourth: 3,
  //     };
  //     const idx = map[option.toLowerCase()];
  //     if (idx !== undefined) {
  //       const q = quizRef.current.questions[currentQuestionRef.current];
  //       if (idx < q.options.length) {
  //         setSelectedAnswers((prev) => ({ ...prev, [q.id]: idx }));
  //         selectedAnswersRef.current = {
  //           ...selectedAnswersRef.current,
  //           [q.id]: idx,
  //         };
  //         speak(`Selected option ${idx + 1}: ${q.options[idx]}`);
  //       }
  //     }
  //   },
  //   [speak],
  // );

  const handleVoiceSelect = useCallback(
    (option: string) => {
      if (submittedRef.current || !quizRef.current) return;
      const map: Record<string, number> = {
        one: 0,
        "1": 0,
        first: 0,
        two: 1,
        "2": 1,
        second: 1,
        three: 2,
        "3": 2,
        third: 2,
        four: 3,
        "4": 3,
        fourth: 3,
      };
      const idx = map[option.toLowerCase()];
      if (idx !== undefined) {
        const q = quizRef.current.questions[currentQuestionRef.current];
        if (idx < q.options.length) {
          setSelectedAnswers((prev) => ({ ...prev, [q.id]: idx }));
          selectedAnswersRef.current = {
            ...selectedAnswersRef.current,
            [q.id]: idx,
          };

          const isLastQuestion =
            currentQuestionRef.current === quizRef.current.questions.length - 1;

          // Confirm selection then tell user what to say next
          speak(
            `Selected option ${idx + 1}: ${q.options[idx]}. ${
              isLastQuestion
                ? "This is the last question. Say submit to finish the quiz."
                : "Say next question to continue."
            }`,
          );
        }
      }
    },
    [speak],
  );

  // const handleVoiceNext = useCallback(() => {
  //   const q = quizRef.current;
  //   if (!q || submittedRef.current) return;
  //   const idx = currentQuestionRef.current;
  //   if (selectedAnswersRef.current[q.questions[idx].id] === undefined) {
  //     speak("Please select an answer first.");
  //     return;
  //   }
  //   if (idx < q.questions.length - 1) {
  //     setCurrentQuestion((prev) => prev + 1);
  //   } else {
  //     speak("This is the last question. Say submit to finish.");
  //   }
  // }, [speak]);

  const handleVoiceNext = useCallback(() => {
    const q = quizRef.current;
    if (!q || submittedRef.current) return;
    const idx = currentQuestionRef.current;
    if (!isAnswered(q.questions[idx], selectedAnswersRef.current)) {
      speak("Please answer the question first.");
      return;
    }
    if (idx < q.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      // The question useEffect will read the next question aloud automatically
    } else {
      speak("This is the last question. Say submit to finish the quiz.");
    }
  }, [speak]);

  const handleVoiceSubmit = useCallback(() => {
    const q = quizRef.current;
    if (!q || submittedRef.current) return;
    const unanswered = q.questions.filter(
      (question) => !isAnswered(question, selectedAnswersRef.current),
    ).length;
    if (unanswered > 0) {
      speak(
        `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Please answer all questions before submitting.`,
      );
      return;
    }
    handleSubmit();
  }, [speak]);

  const handleRepeatQuestion = useCallback(() => {
    const q = quizRef.current;
    if (!q) return;
    const question = q.questions[currentQuestionRef.current];
    if (question.type === "theory") {
      speak(`${question.question}. This is a written answer question.`);
      return;
    }
    const optionsText = question.options
      .map((opt, i) => `Option ${i + 1}: ${opt}`)
      .join(". ");
    speak(`${question.question}. ${optionsText}`);
  }, [speak]);

  const { isListening } = useVoiceCommands(
    [
      {
        command:
          /(select|choose|pick)\s+(option\s+)?(one|two|three|four|1|2|3|4|first|second|third|fourth)/i,
        action: (match) => {
          if (match && match[3]) handleVoiceSelect(match[3]);
        },
      },
      {
        command:
          /option\s+(one|two|three|four|1|2|3|4|first|second|third|fourth)/i,
        action: (match) => {
          if (match && match[1]) handleVoiceSelect(match[1]);
        },
      },
      { command: /next question/i, action: handleVoiceNext },
      {
        command: /(repeat|read|say again|repeat question|read question)/i,
        action: handleRepeatQuestion,
      },
      { command: /(submit|finish|done)/i, action: handleVoiceSubmit },
      {
        command: ["stop speaking", "be quiet"],
        action: () => {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        },
      },
      {
        command: ["help", "commands"],
        action: () =>
          speak(
            "Say select option 1 through 4 to answer. Say next question to continue. Say repeat to hear the question again. Say submit to finish.",
          ),
      },
    ],
    voiceEnabled,
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading quiz...
      </div>
    );
  if (!quiz)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Quiz not found
      </div>
    );

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progressPct = submitted
    ? 100
    : Math.round((currentQuestion / totalQuestions) * 100);
  const gradableQuestions = quiz.questions.filter((q) => q.type !== "theory");
  const score = gradableQuestions.reduce(
    (acc, q) => acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0),
    0,
  );
  const hasGradableQuestions = gradableQuestions.length > 0;
  const scorePct = hasGradableQuestions
    ? Math.round((score / gradableQuestions.length) * 100)
    : 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
          <Link
            to={`/learn/${courseId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to course
          </Link>
        </header>
        <div className="container max-w-2xl py-12 space-y-8">
          <div className="text-center space-y-4">
            <div
              className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto ${!hasGradableQuestions || scorePct >= 80 ? "gradient-primary" : "bg-muted"}`}
            >
              <Trophy
                className={`h-10 w-10 ${!hasGradableQuestions || scorePct >= 80 ? "text-white" : "text-muted-foreground"}`}
              />
            </div>
            <h1 className="text-3xl font-bold">
              {!hasGradableQuestions
                ? "Quiz Completed!"
                : scorePct >= 80
                  ? "Great Job! 🎉"
                  : "Keep Trying!"}
            </h1>
            {hasGradableQuestions ? (
              <p className="text-xl">
                Score:{" "}
                <strong>
                  {score}/{gradableQuestions.length}
                </strong>{" "}
                ({scorePct}%)
              </p>
            ) : (
              <p className="text-muted-foreground">
                Review your answers below.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const userAnswer = selectedAnswers[q.id];

              if (q.type === "theory") {
                return (
                  <Card key={q.id}>
                    <CardContent className="p-4 space-y-3">
                      <p className="font-medium text-sm">
                        Q{i + 1}: {q.question}
                      </p>
                      <div className="text-sm p-3 rounded bg-muted">
                        <p className="text-xs text-muted-foreground mb-1">
                          Your answer:
                        </p>
                        <p className="whitespace-pre-wrap">
                          {typeof userAnswer === "string" && userAnswer.trim()
                            ? userAnswer
                            : "No answer provided"}
                        </p>
                      </div>
                      {q.sampleAnswer && (
                        <div className="text-sm p-3 rounded bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary mb-1">
                            Sample answer:
                          </p>
                          <p className="whitespace-pre-wrap">
                            {q.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }

              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card
                  key={q.id}
                  className={
                    isCorrect ? "border-primary/30" : "border-destructive/30"
                  }
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          Q{i + 1}: {q.question}
                        </p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`text-sm p-2 rounded ${
                                oi === q.correctAnswer
                                  ? "bg-primary/10 text-primary font-medium"
                                  : oi === userAnswer && !isCorrect
                                    ? "bg-destructive/10 text-destructive line-through"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleRetake} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Retake Quiz
            </Button>
            <Link to={`/learn/${courseId}`}>
              <Button className="gradient-primary border-0 text-white">
                Back to Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
        <Link
          to={`/learn/${courseId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="text-sm font-medium truncate flex-1">{quiz.title}</h1>
        <div className="flex items-center gap-3">
          <Progress value={progressPct} className="w-24 h-2" />
          <span className="text-xs text-muted-foreground">
            {currentQuestion + 1}/{totalQuestions}
          </span>
          {/* Voice toggle */}
          <button
            onClick={() => {
              setVoiceEnabled((v) => {
                speak(
                  v ? "Voice commands disabled." : "Voice commands enabled.",
                );
                return !v;
              });
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              voiceEnabled && isListening
                ? "bg-primary/10 text-primary animate-pulse"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={
              voiceEnabled ? "Disable voice commands" : "Enable voice commands"
            }
          >
            {voiceEnabled && isListening ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {voiceEnabled && isListening ? "Listening" : "Voice off"}
            </span>
          </button>
        </div>
      </header>

      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Question {currentQuestion + 1} of {totalQuestions}
              </p>
              <h2 className="text-xl font-bold">{question.question}</h2>
            </div>

            {question.type === "theory" ? (
              <Textarea
                value={
                  typeof selectedAnswers[question.id] === "string"
                    ? (selectedAnswers[question.id] as string)
                    : ""
                }
                onChange={(e) => handleTheoryAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows={6}
              />
            ) : (
              <div className="space-y-3">
                {question.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(i)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all text-sm ${
                      selectedAnswers[question.id] === i
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border mr-3 text-xs font-medium">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Voice commands hint */}
            {voiceEnabled && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="font-medium flex items-center gap-1">
                  {isListening ? (
                    <>
                      <Mic className="h-3 w-3 text-primary animate-pulse" />{" "}
                      Listening for commands
                    </>
                  ) : (
                    <>
                      <MicOff className="h-3 w-3" /> Voice commands
                    </>
                  )}
                </p>
                <p>
                  {question.type !== "theory" && (
                    <>
                      <span className="text-foreground">
                        Select option 1–{question.options.length}
                      </span>{" "}
                      ·{" "}
                    </>
                  )}
                  <span className="text-foreground">Next question</span> ·{" "}
                  <span className="text-foreground">Repeat</span> ·{" "}
                  <span className="text-foreground">Submit</span>
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                Previous
              </Button>
              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered(question, selectedAnswers)}
                  className="gradient-primary border-0 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={quiz.questions.some(
                    (q) => !isAnswered(q, selectedAnswers),
                  )}
                  className="gradient-primary border-0 text-white"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
