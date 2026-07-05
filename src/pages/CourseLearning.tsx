import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  Menu,
  X,
  Lock,
  Trophy,
  BookOpenCheck,
  Mic,
  MicOff,
  FileText,
  Download,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "@/hooks/useTTS";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import type { Course } from "@/types";

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const CourseLearning = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useTTS();

  // const currentLessonRef = useRef(currentLesson);
  // useEffect(() => {
  //   currentLessonRef.current = currentLesson;
  // }, [currentLesson]);

  const {
    isEnrolled,
    completeLesson,
    isLessonCompleted,
    completeModule,
    isModuleCompleted,
    getEnrolledCourse,
  } = useEnrollmentStore();

  useEffect(() => {
    if (!courseId) return;
    api.getCourseById(courseId).then((c) => {
      if (c) {
        const hasAccess = c.hasAccess === true || isEnrolled(courseId);
        if (!hasAccess) {
          navigate(`/courses/${courseId}`);
          toast({
            title: "Payment required",
            description: "Please complete payment before starting this course.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        setCourse(c);
        const enrollment = getEnrolledCourse(courseId);
        let firstIncomplete: string | null = null;
        for (const mod of c.modules) {
          for (const les of mod.lessons) {
            if (!enrollment?.completedLessons.includes(les.id)) {
              firstIncomplete = les.id;
              break;
            }
          }
          if (firstIncomplete) break;
        }
        setCurrentLessonId(
          firstIncomplete || c.modules[0]?.lessons[0]?.id || null,
        );
      }
      setLoading(false);
    });
  }, [courseId, isEnrolled, getEnrolledCourse, navigate, toast]);

  const allLessons = useMemo(
    () => course?.modules.flatMap((m) => m.lessons) ?? [],
    [course],
  );
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const enrollment = courseId ? getEnrolledCourse(courseId) : undefined;
  const completedCount = enrollment?.completedLessons.length ?? 0;
  const progressPct =
    allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;
  const allLessonsComplete =
    allLessons.length > 0 && completedCount === allLessons.length;
  const hasNoContent = !loading && course && allLessons.length === 0;
  
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  useEffect(() => {
    setIsVideoEnded(currentLesson?.type !== "video");
  }, [currentLesson?.id, currentLesson?.type]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === "string") {
        try {
          const data = JSON.parse(e.data);
          if (data.event === "infoDelivery" && data.info?.playerState === 0) {
            setIsVideoEnded(true);
          }
        } catch {}
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ── Expose video controls globally (same pattern as frontend VideoPlayer) ──
  useEffect(() => {
    (window as any).videoControls = {
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      rewind: () => {
        if (videoRef.current)
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 10,
          );
      },
      forward: () => {
        if (videoRef.current)
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + 10,
          );
      },
      mute: () => {
        if (videoRef.current) videoRef.current.muted = true;
      },
      unmute: () => {
        if (videoRef.current) videoRef.current.muted = false;
      },
      volumeUp: () => {
        if (videoRef.current)
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
      },
      volumeDown: () => {
        if (videoRef.current)
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
      },
      restart: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      },
    };
    return () => {
      delete (window as any).videoControls;
    };
  }, []);

  const isModuleUnlocked = (moduleIndex: number) => {
    if (moduleIndex === 0) return true;
    const prevModule = course?.modules[moduleIndex - 1];
    if (!prevModule) return true;
    const lessonsCompleted = prevModule.lessons.every((l) =>
      enrollment?.completedLessons.includes(l.id),
    );
    const quizCompleted = prevModule.quizId
      ? enrollment?.quizAttempts?.some((a) => a.quizId === prevModule.quizId) ?? false
      : true;
    return lessonsCompleted && quizCompleted;
  };

  const currentIndexRef = useRef(currentIndex);
  const allLessonsRef = useRef(allLessons);
  // const courseIdRef = useRef(courseId);
  const courseIdRef = useRef(courseId);
  // add this ref alongside the existing ones
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const courseRef = useRef(course);
  const enrollmentRef = useRef(enrollment);
  const currentLessonIdRef = useRef(currentLessonId);

  const currentLessonRef = useRef(currentLesson);
  useEffect(() => {
    currentLessonRef.current = currentLesson;
  }, [currentLesson]);

  useEffect(() => {
    currentLessonIdRef.current = currentLessonId;
  }, [currentLessonId]);
  useEffect(() => {
    currentLessonRef.current = currentLesson;
  }, [currentLesson]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    allLessonsRef.current = allLessons;
  }, [allLessons]);
  useEffect(() => {
    courseIdRef.current = courseId;
  }, [courseId]);
  useEffect(() => {
    courseRef.current = course;
  }, [course]);
  useEffect(() => {
    enrollmentRef.current = enrollment;
  }, [enrollment]);
  useEffect(() => {
    currentLessonIdRef.current = currentLessonId;
  }, [currentLessonId]);

  const handleMarkComplete = useCallback(() => {
    const cId = courseIdRef.current;
    const lessonId = currentLessonIdRef.current;
    const c = courseRef.current;
    const enroll = enrollmentRef.current;
    const idx = currentIndexRef.current;
    const lessons = allLessonsRef.current;
    if (!cId || !lessonId || !c) return;
    completeLesson(cId, lessonId);
    const currentModule = c.modules.find((m) =>
      m.lessons.some((l) => l.id === lessonId),
    );
    if (currentModule) {
      const allDone = currentModule.lessons.every(
        (l) =>
          l.id === lessonId ||
          (enroll?.completedLessons.includes(l.id) ?? false),
      );
      if (allDone) {
        completeModule(cId, currentModule.id);
        speak(`Module complete! You have completed ${currentModule.title}`);
        toast({
          title: "Module Complete! 🎉",
          description: `You've completed "${currentModule.title}"`,
        });
      } else {
        speak("Lesson marked as complete. Great progress!");
        toast({
          title: "Lesson Complete! ✓",
          description: "Great progress! Keep going.",
        });
      }
    }
    if (idx < lessons.length - 1) {
      setCurrentLessonId(lessons[idx + 1].id);
    }
  }, [completeLesson, completeModule, speak, toast]);

  // Announce lesson when it changes
  // useEffect(() => {
  //   if (!currentLesson) return;
  //   setTimeout(() => {
  //     speak(
  //       `Now playing: ${currentLesson.title}. Say play to start, pause to pause, rewind or forward to skip. Say mark complete when done.`,
  //     );
  //   }, 600);
  // }, [currentLessonId]);

  useEffect(() => {
    if (!currentLesson) return;
    setTimeout(() => {
      if (currentLesson.type === "reading") {
        speak(
          `${currentLesson.title}. ${currentLesson.description ?? ""}. Say read again to hear this again, next lesson, previous lesson, or mark complete.`,
        );
      } else {
        speak(
          `Now playing: ${currentLesson.title}. Say play to start, pause to pause, rewind or forward to skip. Say mark complete when done.`,
        );
      }
    }, 600);
  }, [currentLessonId]);

  // Voice commands — call window.videoControls so TTS finishes before video plays
  const handleVoicePlay = useCallback(() => {
    speak("Playing");
    setTimeout(() => (window as any).videoControls?.play(), 600);
  }, [speak]);

  const handleVoicePause = useCallback(() => {
    (window as any).videoControls?.pause();
    speak("Paused");
  }, [speak]);

  const handleVoiceRewind = useCallback(() => {
    (window as any).videoControls?.rewind();
    speak("Rewound 10 seconds");
  }, [speak]);

  const handleVoiceForward = useCallback(() => {
    (window as any).videoControls?.forward();
    speak("Forwarded 10 seconds");
  }, [speak]);

  const handleVoiceMute = useCallback(() => {
    (window as any).videoControls?.mute();
    speak("Muted");
  }, [speak]);

  const handleVoiceUnmute = useCallback(() => {
    (window as any).videoControls?.unmute();
    speak("Unmuted");
  }, [speak]);

  // const handleNextLesson = useCallback(() => {
  //   const idx = currentIndexRef.current;
  //   const lessons = allLessonsRef.current;
  //   if (idx < lessons.length - 1) {
  //     setCurrentLessonId(lessons[idx + 1].id);
  //     speak(`Next lesson: ${lessons[idx + 1].title}`);
  //   } else {
  //     speak("This is the last lesson.");
  //   }
  // }, [speak]);

  // const handlePrevLesson = useCallback(() => {
  //   const idx = currentIndexRef.current;
  //   const lessons = allLessonsRef.current;
  //   if (idx > 0) {
  //     setCurrentLessonId(lessons[idx - 1].id);
  //     speak(`Previous lesson: ${lessons[idx - 1].title}`);
  //   } else {
  //     speak("This is the first lesson.");
  //   }
  // }, [speak]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    (window as any).videoControls = {
      play: () => {
        if (videoRef.current) {
          videoRef.current.play();
        } else if (iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            "*",
          );
        }
      },
      pause: () => {
        if (videoRef.current) {
          videoRef.current.pause();
        } else if (iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            "*",
          );
        }
      },
      rewind: () => {
        if (videoRef.current)
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 10,
          );
      },
      forward: () => {
        if (videoRef.current)
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + 10,
          );
      },
      mute: () => {
        if (videoRef.current) videoRef.current.muted = true;
      },
      unmute: () => {
        if (videoRef.current) videoRef.current.muted = false;
      },
      volumeUp: () => {
        if (videoRef.current)
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
      },
      volumeDown: () => {
        if (videoRef.current)
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
      },
      restart: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      },
    };
    return () => {
      delete (window as any).videoControls;
    };
  }, []);

  const handleNextLesson = useCallback(() => {
    const idx = currentIndexRef.current;
    const lessons = allLessonsRef.current;
    const c = courseRef.current;
    const cId = courseIdRef.current;

    if (idx < lessons.length - 1) {
      // There is a next video/text lesson
      const next = lessons[idx + 1];
      setCurrentLessonId(next.id);
      speak(`Next lesson: ${next.title}`);
    } else {
      // No more lessons — check if there is a quiz
      const quizModule = c?.modules.find((m) => m.quizId);
      if (quizModule?.quizId) {
        speak("All lessons complete. Starting the quiz now.");
        setTimeout(() => {
          navigateRef.current(`/learn/${cId}/quiz/${quizModule.quizId}`);
        }, 1500);
      } else {
        speak("You have completed all lessons in this course. Well done!");
      }
    }
  }, [speak]);

  const handlePrevLesson = useCallback(() => {
    const idx = currentIndexRef.current;
    const lessons = allLessonsRef.current;

    if (idx > 0) {
      const prev = lessons[idx - 1];
      setCurrentLessonId(prev.id);
      speak(`Previous lesson: ${prev.title}`);
    } else {
      speak("This is the first lesson.");
    }
  }, [speak]);

  // const { isListening } = useVoiceCommands(

  const { isListening, isSupported, startRecognition } = useVoiceCommands(
    [
      { command: /^(play|start|resume)$/i, action: handleVoicePlay },
      { command: /^(pause|stop)$/i, action: handleVoicePause },
      { command: /(rewind|go back|backward)/i, action: handleVoiceRewind },
      { command: /(forward|fast forward|skip)/i, action: handleVoiceForward },
      { command: /(mute|silence)/i, action: handleVoiceMute },
      { command: /(unmute|sound on)/i, action: handleVoiceUnmute },
      { command: /next (lesson|video)/i, action: handleNextLesson },
      { command: /previous (lesson|video)/i, action: handlePrevLesson },
      {
        command: /(mark complete|mark as complete|done|complete)/i,
        action: handleMarkComplete,
      },
      // {
      //   command: /(read again|repeat|listen again)/i,
      //   action: () => {
      //     if (currentLesson?.type === "text") {
      //       speak(`${currentLesson.title}. ${currentLesson.description ?? ""}`);
      //     }
      //   },
      // },

      {
        command: ["stop speaking", "be quiet"],
        action: () => {
          window.speechSynthesis?.cancel();
        },
      },
      {
        command: ["help", "commands", "what can i say"],
        action: () =>
          speak(
            "Available commands: Play, Pause, Rewind, Forward, Mute, Unmute, Next lesson, Previous lesson, Mark complete, Stop speaking.",
          ),
      },
      {
        command: /(read again|repeat|listen again)/i,
        action: () => {
          const lesson = currentLessonRef.current;
          if (lesson?.type === "reading") {
            speak(`${lesson.title}. ${lesson.description ?? ""}`);
          }
        },
      },
    ],
    voiceEnabled,
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Course not found
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b bg-card flex items-center px-4 gap-4 shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <Link
          to={`/courses/${courseId}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to course</span>
        </Link>
        <h1 className="text-sm font-medium truncate flex-1">{course.title}</h1>
        <div className="flex items-center gap-3">
          <Progress value={progressPct} className="w-24 h-2 hidden sm:block" />
          <span className="text-xs text-muted-foreground">{progressPct}%</span>
          {/* <button
            onClick={() =>
              setVoiceEnabled((v) => {
                speak(
                  v ? "Voice commands disabled." : "Voice commands enabled.",
                );
                return !v;
              })
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${voiceEnabled && isListening ? "bg-primary/10 text-primary animate-pulse" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {voiceEnabled && isListening ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {voiceEnabled && isListening ? "Listening" : "Voice off"}
            </span>
          </button> */}

          <button
            onClick={() => {
              if (!isSupported) {
                toast({
                  title: "Not supported",
                  description:
                    "Voice commands are not supported on this browser.",
                  variant: "destructive",
                });
                return;
              }
              setVoiceEnabled((v) => {
                if (!v) {
                  speak("Voice commands enabled.");
                  startRecognition();
                } else {
                  speak("Voice commands disabled.");
                }
                return !v;
              });
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              !isSupported
                ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                : voiceEnabled && isListening
                  ? "bg-primary/10 text-primary animate-pulse"
                  : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {voiceEnabled && isListening ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {!isSupported
                ? "Not supported"
                : voiceEnabled && isListening
                  ? "Listening"
                  : "Tap to enable voice"}
            </span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!hasNoContent && (
          <aside
            className={`${sidebarOpen ? "w-80" : "w-0"} border-r bg-card overflow-y-auto transition-all duration-300 shrink-0 ${sidebarOpen ? "block" : "hidden"} md:block`}
          >
            <div className="p-4 space-y-4">
              {course.modules.map((mod, modIdx) => {
                const unlocked = isModuleUnlocked(modIdx);
                const modComplete = courseId
                  ? isModuleCompleted(courseId, mod.id)
                  : false;
                const isQuizOnlyModule =
                  mod.lessons.length === 0 && !!mod.quizId;
                return (
                  <div key={mod.id}>
                    <div className="flex items-center gap-2 mb-2">
                      {modComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : unlocked ? (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h3
                        className={`text-xs font-semibold uppercase tracking-wider ${!unlocked ? "text-muted-foreground" : ""}`}
                      >
                        {mod.title}
                      </h3>
                    </div>
                    <div className="ml-6 space-y-0.5">
                      {mod.lessons.map((lesson) => {
                        const completed = courseId
                          ? isLessonCompleted(courseId, lesson.id)
                          : false;
                        const isActive = lesson.id === currentLessonId;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentLessonId(lesson.id);
                              if (window.innerWidth < 768)
                                setSidebarOpen(false);
                            }}
                            className={`w-full text-left flex items-center gap-2 p-2 rounded-md text-xs transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate flex-1">
                              {lesson.title}
                            </span>
                            <span className="text-muted-foreground">
                              {lesson.duration}
                            </span>
                          </button>
                        );
                      })}
                      {mod.quizId && (
                        <button
                          onClick={() => {
                            if (!unlocked) {
                              toast({ title: "Module Locked", description: "Please complete previous modules first.", variant: "destructive" });
                              return;
                            }
                            if (!isQuizOnlyModule && !mod.lessons.every((l) => courseId ? isLessonCompleted(courseId, l.id) : false)) {
                              toast({ title: "Lessons Incomplete", description: "Please complete all lessons in this module before taking the quiz.", variant: "destructive" });
                              return;
                            }
                            if (mod.quizId) {
                              navigate(`/learn/${courseId}/quiz/${mod.quizId}`);
                            } else {
                              toast({ title: "No Quiz", description: "This module does not have a quiz.", variant: "destructive" });
                            }
                          }}
                          className={`w-full text-left flex items-center gap-2 p-2 rounded-md text-xs transition-colors ${unlocked && (isQuizOnlyModule || mod.lessons.every((l) => (courseId ? isLessonCompleted(courseId, l.id) : false))) ? "hover:bg-muted text-primary font-medium" : "opacity-50 cursor-not-allowed"}`}
                        >
                          <Trophy className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {isQuizOnlyModule ? mod.title : "Take Quiz"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Certificate Module (Mock module at the end) */}
              {enrollment?.certificateId && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Certificate
                    </h3>
                  </div>
                  <div className="ml-6 space-y-0.5">
                    <button
                      onClick={() => {
                        setCurrentLessonId("certificate");
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-2 p-2 rounded-md text-xs transition-colors ${
                        currentLessonId === "certificate"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Award className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate flex-1">Your Certificate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          {hasNoContent ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <BookOpenCheck className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">You're enrolled!</h2>
                <p className="text-muted-foreground">
                  Content for{" "}
                  <span className="font-medium text-foreground">
                    {course.title}
                  </span>{" "}
                  is being prepared. Check back soon.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <Link to="/my-learning">
                    <Button variant="outline">My Learning</Button>
                  </Link>
                  <Link to="/courses">
                    <Button variant="outline">Explore Academy</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : currentLessonId === "certificate" && enrollment?.certificateId ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center space-y-6 max-w-2xl bg-white shadow-xl rounded-2xl p-10 border">
                <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                  <Award className="h-10 w-10 text-indigo-500" />
                </div>
                <h2 className="text-3xl font-bold">Your Certificate is Ready!</h2>
                <p className="text-muted-foreground text-lg">
                  Congratulations on completing <strong>{course.title}</strong>. Your official certificate has been issued and is available to view, print, or share.
                </p>
                <div className="pt-6 flex justify-center">
                  <Link to={`/verify/${enrollment.certificateId}`} target="_blank">
                    <Button size="lg" className="gap-2">
                      <Award className="h-5 w-5" />
                      View Official Certificate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : currentLesson ? (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              {currentLesson.type === "video" && currentLesson.videoUrl
                ? (() => {
                    const embedUrl = getYoutubeEmbedUrl(currentLesson.videoUrl);
                    return embedUrl ? (
                      <iframe
                        ref={iframeRef}
                        key={currentLesson.id}
                        src={`${embedUrl}?enablejsapi=1`}
                        className="w-full aspect-video rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        key={currentLesson.id}
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full aspect-video rounded-xl bg-black"
                        controlsList="nodownload"
                        onEnded={() => setIsVideoEnded(true)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  })()
                : null}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentLesson.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {currentLesson.duration}
                  </span>
                  {voiceEnabled && isListening && (
                    <span className="flex items-center gap-1 text-xs text-primary animate-pulse">
                      <Mic className="h-3 w-3" /> Listening
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                <p className="text-muted-foreground">
                  {currentLesson.description}
                </p>

                {/* {voiceEnabled && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="font-medium">Voice commands:</p>
                    <p>
                      Video:{" "}
                      <span className="text-foreground">
                        Play · Pause · Rewind · Forward · Mute · Unmute
                      </span>
                    </p>
                    <p>
                      Navigation:{" "}
                      <span className="text-foreground">
                        Next lesson · Previous lesson · Mark complete
                      </span>
                    </p>
                    <p>
                      Other:{" "}
                      <span className="text-foreground">
                        Help · Stop speaking
                      </span>
                    </p>
                  </div>
                )} */}

                {voiceEnabled && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="font-medium">Voice commands:</p>
                    {currentLesson.type === "reading" ? (
                      <>
                        <p>
                          Reading:{" "}
                          <span className="text-foreground">Read again</span>
                        </p>
                        <p>
                          Navigation:{" "}
                          <span className="text-foreground">
                            Next lesson · Previous lesson · Mark complete
                          </span>
                        </p>
                        <p>
                          Other:{" "}
                          <span className="text-foreground">Stop speaking</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          Video:{" "}
                          <span className="text-foreground">
                            Play · Pause · Rewind · Forward · Mute · Unmute
                          </span>
                        </p>
                        <p>
                          Navigation:{" "}
                          <span className="text-foreground">
                            Next lesson · Previous lesson · Mark complete
                          </span>
                        </p>
                        <p>
                          Other:{" "}
                          <span className="text-foreground">
                            Help · Stop speaking
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Resources Section */}
              {(currentLesson.documentUrl || currentLesson.transcriptUrl) && (
                <div className="pt-4 space-y-3 border-t">
                  <h3 className="text-lg font-semibold">Resources</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentLesson.documentUrl && (
                      <a
                        href={currentLesson.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        Learning Document
                        <Download className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                      </a>
                    )}
                    {currentLesson.transcriptUrl && (
                      <a
                        href={currentLesson.transcriptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <FileText className="h-4 w-4 text-emerald-500" />
                        Video Transcript
                        <Download className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() =>
                    currentIndex > 0 &&
                    setCurrentLessonId(allLessons[currentIndex - 1].id)
                  }
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                {courseId && !isLessonCompleted(courseId, currentLesson.id) ? (
                  <Button
                    className="gradient-primary border-0 text-white gap-2"
                    onClick={handleMarkComplete}
                    disabled={!isVideoEnded}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as Complete
                  </Button>
                ) : (
                  <Badge variant="secondary" className="gap-1 px-3 py-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Completed
                  </Badge>
                )}
                <Button
                  variant="outline"
                  disabled={currentIndex === allLessons.length - 1}
                  onClick={() =>
                    currentIndex < allLessons.length - 1 &&
                    setCurrentLessonId(allLessons[currentIndex + 1].id)
                  }
                  className="gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {allLessonsComplete && (
                <div className="rounded-xl gradient-primary p-6 text-white text-center space-y-3">
                  <Trophy className="h-8 w-8 mx-auto" />
                  <p className="font-bold text-lg">All lessons completed! 🎉</p>
                  <p className="text-sm opacity-80">
                    You can rewatch any video by clicking it in the sidebar.
                  </p>
                  {course.modules.some((m) => m.quizId) && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const lq = course.modules.filter((m) => m.quizId).pop();
                        if (lq?.quizId)
                          navigate(`/learn/${courseId}/quiz/${lq.quizId}`);
                      }}
                    >
                      Take Final Quiz
                    </Button>
                  )}
                  <div className="flex gap-3 justify-center pt-1">
                    <Link to="/my-learning">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-foreground"
                      >
                        My Learning
                      </Button>
                    </Link>
                    <Link to="/courses">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-foreground"
                      >
                        Explore Academy
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : allLessonsComplete ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center space-y-6 max-w-md">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Congratulations! 🎉</h2>
                <p className="text-muted-foreground">
                  You've completed all lessons in this course.
                </p>
                {course.modules.some((m) => m.quizId) && (
                  <Button
                    className="gradient-primary border-0 text-white"
                    size="lg"
                    onClick={() => {
                      const lq = course.modules.filter((m) => m.quizId).pop();
                      if (lq?.quizId)
                        navigate(`/learn/${courseId}/quiz/${lq.quizId}`);
                    }}
                  >
                    Take Final Quiz
                  </Button>
                )}
                <div className="flex gap-3 justify-center">
                  <Link to="/my-learning">
                    <Button variant="outline">My Learning</Button>
                  </Link>
                  {enrollment?.certificateId && (
                    <Button
                      className="gradient-primary border-0 text-white"
                      onClick={() => setCurrentLessonId("certificate")}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Claim Certificate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default CourseLearning;
