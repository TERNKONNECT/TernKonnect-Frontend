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
        "TERNKONNECT is an AI-powered intelligent assistive technology solution transforming how people with disabilities experience digital learning. Would you like to get a demo or start free trial?",
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
        command: /(get a demo|request a demo|demo)/i,
        action: () => {
          speak("Taking you to our contact page to request a demo.");
          setTimeout(() => navigate("/contact"), 1200);
        },
      },
      {
        command: /(start free trial|free trial|trial)/i,
        action: () => {
          speak("Taking you to sign up for a free trial.");
          setTimeout(() => navigate("/signup"), 1200);
        },
      },
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

  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[480px] sm:h-[540px] md:h-[620px] w-full">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&auto=format&fit=crop&q=80"
            alt="African students studying together"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/75" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 space-y-5 max-w-3xl mx-auto">
            <h1 className="text-[1.9rem] leading-[1.2] sm:text-4xl md:text-6xl font-extrabold tracking-tight text-white">
              Accessible. Inclusive.{" "}
              <span className="text-gradient"> Limitless.</span>
            </h1>

            <p className="text-[0.9rem] sm:text-base md:text-xl text-white/80 max-w-2xl leading-relaxed">
              TERNKONNECT is an AI-powered intelligent assistive technology
              solution transforming how people with disabilities experience
              digital learning.
            </p>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-lg gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Explore how it works..."
                  className="pl-9 h-11 bg-white/95 text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="font-semibold text-sm w-full"
                >
                  Get a Demo
                </Button>
              </Link>
            </form>
            {/* <div className="flex items-center justify-center gap-5 text-xs sm:text-sm text-white/70 pt-1">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> 500K+ Learners
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" /> 50+ Courses
              </span>
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" /> 4.8 Avg Rating
              </span>
            </div> */}
            {voiceStarted && (
              <p className="text-sm text-white/90 animate-pulse flex items-center gap-2">
                <Mic className="h-4 w-4" /> Listening... Say "Get a demo" or
                "start free trial"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 md:py-20 container max-w-5xl mx-auto px-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary text-center mb-2">
          How It Works
        </p>
        <h2 className="text-[1.2rem] sm:text-2xl font-bold text-center mb-10">
          Simple to use. Seamless to integrate. Built to scale.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              img: "/pnp.jpeg",
              alt: "Young African man using a laptop",
              step: "01",
              title: "Plug-and-Play Accessibility",
              desc: "Install the browser extension and instantly transform any learning platform into an accessible experience; no changes required.",
            },
            {
              img: "/si.jpeg",
              alt: "African developer working on code",
              step: "02",
              title: "Seamless Platform Integration",
              desc: "Integrate TERNKONNECT via API to embed accessibility directly into your EdTech product natively and at scale.",
            },
            {
              img: "/erd.jpeg",
              alt: "African university classroom with students",
              step: "03",
              title: "Enterprise-Ready Deployment",
              desc: "Roll out across entire institutions with centralized control, user management, and full accessibility coverage.",
            },
          ].map(({ img, alt, step, title, desc }) => (
            <div
              key={step}
              className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <img src={img} alt={alt} className="w-full h-40 object-cover" />
              <div className="p-4 space-y-2">
                <span className="text-[0.7rem] font-bold text-primary tracking-widest">
                  {step}
                </span>
                <h3 className="font-semibold text-[0.95rem] md:text-base">
                  {title}
                </h3>
                <p className="text-muted-foreground text-[0.8rem] md:text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accessibility Split ── */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <iframe
              src="https://www.youtube.com/embed/BWmiwaUgy7A"
              title="Disabled person using tablet for accessible learning"
              className="w-full h-56 sm:h-72 md:h-80"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Built for Accessibility
            </p>
            <h2 className="text-[1.2rem] sm:text-2xl md:text-3xl font-extrabold leading-snug">
              We make learning inclusive{" "}
              <span className="text-gradient">
                for every learner, everywhere
              </span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              We close the digital accessibility gap with real-time
              text-to-speech, live captions, adaptive visuals, and
              keyboard-first design, so every learner can participate.
            </p>
            <Link to="/about">
              <Button className="gradient-primary border-0 text-white font-semibold text-sm mt-1">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {/* <section className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4">
          <h2 className="text-[1.15rem] sm:text-2xl font-bold mb-8 text-center">
            What Our Partner Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-[0.82rem] sm:text-sm text-muted-foreground italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}
    </MainLayout>
  );
};

export default Index;
