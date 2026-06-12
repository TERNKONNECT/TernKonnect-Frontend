import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Star,
  GraduationCap,
  Users,
  Award,
  ChevronRight,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layouts/MainLayout";
import CourseCard from "@/components/CourseCard";
import { api } from "@/services/api";
import { CATEGORIES } from "@/types";
import { testimonials } from "@/data/courses";
import type { Course } from "@/types";
import { useTTS } from "@/hooks/useTTS";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceStarted, setVoiceStarted] = useState(false);
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const navigate = useNavigate();
  const { speak } = useTTS();
  const flowStep = useRef<"idle" | "ask-auth" | "ask-course">("idle");
  const coursesRef = useRef<Course[]>([]);

  useEffect(() => {
    api.getFeaturedCourses().then((c) => {
      setFeaturedCourses(c);
      coursesRef.current = c;
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const step = localStorage.getItem("voice_flow_step");
    if (step === "ask-course") {
      localStorage.removeItem("voice_flow_step");
      flowStep.current = "ask-course";
      setVoiceStarted(true);
      voiceStartedRef.current = true;
      const trySpeak = () => {
        const courses = coursesRef.current;
        if (courses.length === 0) {
          setTimeout(trySpeak, 500);
          return;
        }
        const titles = courses.map((c) => c.title).join(". ");
        speak(
          `Welcome back! Here are the available courses: ${titles}. Which course would you like to take?`,
        );
      };
      setTimeout(trySpeak, 800);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim())
      navigate(`/courses?q=${encodeURIComponent(searchQuery)}`);
  };

  const voiceStartedRef = useRef(false);

  const startVoice = () => {
    if (voiceStartedRef.current) return;
    voiceStartedRef.current = true;
    setVoiceStarted(true);
    localStorage.removeItem("voice_flow_step");
    setTimeout(() => {
      speak(
        "TERNKONNECT is an AI-powered intelligent assistive technology solution transforming how people with disabilities experience digital learning.",
      );
      flowStep.current = "ask-auth";
    }, 300);
  };

  useEffect(() => {
    const handler = () => startVoice();
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);

  // const { startRecognition } = useVoiceCommands(
  //   [
  //     {
  //       command: /(get a demo|request a demo|demo)/i,
  //       action: () => {
  //         speak("Taking you to our contact page to request a demo.");
  //         setTimeout(() => navigate("/contact"), 1200);
  //       },
  //     },
  //     {
  //       command: /(start free trial|free trial|trial)/i,
  //       action: () => {
  //         speak("Taking you to sign up for a free trial.");
  //         setTimeout(() => navigate("/signup"), 1200);
  //       },
  //     },
  //     {
  //       command: /(log in|login|sign in)/i,
  //       action: () => {
  //         speak("Taking you to the login page.");
  //         localStorage.setItem("voice_flow_step", "login-email");
  //         localStorage.setItem("voice_flow_after_login", "ask-course");
  //         setTimeout(() => navigate("/login"), 1200);
  //       },
  //     },
  //     {
  //       command: /(sign up|register|create account)/i,
  //       action: () => {
  //         speak("Taking you to the sign up page.");
  //         localStorage.setItem("voice_flow_step", "signup-name");
  //         setTimeout(() => navigate("/signup"), 1200);
  //       },
  //     },
  //     {
  //       command: /.+/,
  //       action: (match) => {
  //         if (flowStep.current !== "ask-course") return;
  //         const transcript = (match?.[0] ?? "").toLowerCase();
  //         const courses = coursesRef.current;
  //         const found = courses.find(
  //           (c) =>
  //             c.title.toLowerCase().includes(transcript) ||
  //             transcript.includes(
  //               c.title.toLowerCase().split(" ").slice(0, 3).join(" "),
  //             ),
  //         );
  //         if (found) {
  //           speak(`Taking you to ${found.title}.`);
  //           setTimeout(() => navigate(`/courses/${found.id}`), 1200);
  //         } else {
  //           speak(
  //             `Sorry, I could not find that course. Please say the course name again.`,
  //           );
  //         }
  //       },
  //     },
  //   ],
  //   voiceStarted,
  // );

  const { startRecognition } = useVoiceCommands(
    [

      {
        command: /(log in|login|sign in)/i,
        action: () => {
          speak("Taking you to the login page.");
          localStorage.setItem("voice_flow_step", "login-email");
          localStorage.setItem("voice_flow_after_login", "ask-course");
          setTimeout(() => navigate("/login"), 1200);
        },
      },
      {
        command: /(sign up|register|create account)/i,
        action: () => {
          speak("Taking you to the sign up page.");
          localStorage.setItem("voice_flow_step", "signup-name");
          setTimeout(() => navigate("/signup"), 1200);
        },
      },
      {
        command: /.+/,
        action: (match) => {
          if (flowStep.current !== "ask-course") return;
          const transcript = (match?.[0] ?? "").toLowerCase();
          const courses = coursesRef.current;
          const found = courses.find(
            (c) =>
              c.title.toLowerCase().includes(transcript) ||
              transcript.includes(
                c.title.toLowerCase().split(" ").slice(0, 3).join(" "),
              ),
          );
          if (found) {
            speak(`Taking you to ${found.title}.`);
            setTimeout(() => navigate(`/courses/${found.id}`), 1200);
          } else {
            speak(
              `Sorry, I could not find that course. Please say the course name again.`,
            );
          }
        },
      },
    ],
    voiceStarted,
  );

  const displayCourses = featuredCourses.filter((c) => c.category === activeTab);
  const coursesToShow = displayCourses.length > 0 ? displayCourses : featuredCourses.slice(0, 4);

  return (
    <MainLayout>
      {/* ── Hero Split Layout ── */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Expand Your Horizons with <span className="text-gradient">Accessible Learning</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Master new skills, advance your career, and learn from industry experts with our inclusive, AI-powered platform.
              </p>
              
              <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto lg:mx-0 gap-2 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="What do you want to learn today?"
                    className="pl-10 h-14 text-base border-2 focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-14 px-8 text-base font-semibold gradient-primary text-white border-0">
                  Search
                </Button>
              </form>
            </div>
            
            <div className="relative hidden lg:block h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl transform rotate-3 scale-105"></div>
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80"
                alt="African students studying"
                className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo Cloud ── */}
      <section className="border-y bg-muted/20 py-10">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
            Trusted by our forward-thinking clients
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <h3 className="text-2xl font-bold font-serif">DWS</h3>
            <h3 className="text-2xl font-bold font-mono">JobMingles</h3>
            <h3 className="text-2xl font-bold tracking-widest">Erilearn</h3>
          </div>
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow text-center md:text-left">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn from experts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gain real-world skills from industry leaders and professionals who are passionate about teaching.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow text-center md:text-left">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Accessible to everyone</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our platform features built-in assistive technologies ensuring an inclusive experience for all learners.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow text-center md:text-left">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn certificates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Showcase your new skills with verifiable certificates that you can share with employers and your network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Broad Selection Tabs ── */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">A broad selection of courses</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            Choose from over 100 online courses with new additions published every month.
          </p>
          
          <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === category 
                    ? "bg-foreground text-background shadow-md" 
                    : "bg-card text-muted-foreground hover:bg-muted border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="bg-card border p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold mb-2">Expand your career opportunities with {activeTab}</h3>
            <p className="text-muted-foreground mb-8 max-w-4xl">
              Whether you're looking to start a new career or advance in your current field, our {activeTab} courses will give you the skills you need to succeed.
            </p>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[320px] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {coursesToShow.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
            
            <div className="mt-8">
              <Link to={`/courses?category=${encodeURIComponent(activeTab)}`}>
                <Button variant="outline" className="font-semibold px-8">
                  Explore {activeTab}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-12 text-center">
            How learners like you are achieving their goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <Card key={t.id} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-base text-foreground leading-relaxed italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-12 w-12 rounded-full ring-2 ring-primary/20"
                    />
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instructor Banner ── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Become an Instructor</h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instructors from around the world teach millions of learners on our platform. We provide the tools and skills to teach what you love.
          </p>
          <Link to="/instructor-signup">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-bold px-10 h-14 text-lg">
              Start Teaching Today
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
