import {
  Heart,
  Globe,
  Zap,
  Headphones,
  Captions,
  Keyboard,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layouts/MainLayout";

const pillars = [
  {
    icon: <Heart className="h-5 w-5 text-primary" />,
    title: "Accessibility First",
    desc: "We design for inclusion from the start, not as an afterthought, so every learner can participate independently.",
    img: "/pic1.jpeg",
    alt: "Diverse African students learning together",
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Breaking Barriers with Technology",
    desc: "We use AI to transform inaccessible systems into seamless, inclusive learning experiences.",
    img: "/pic2.jpeg",
    alt: "African student using headphones with a laptop",
  },
  {
    icon: <Globe className="h-5 w-5 text-primary" />,
    title: "Expanding Opportunity",
    desc: "We unlock access to education, especially in underserved communities, because access drives opportunity.",
    img: "/pic3.jpeg",
    alt: "African children in a classroom with technology",
  },
];

const features = [
  {
    icon: <Headphones className="h-4 w-4" />,
    label: "Text-to-Speech",
    desc: "Turns written content into structured, natural audio.",
  },
  {
    icon: <Captions className="h-4 w-4" />,
    label: "Real-Time Transcription",
    desc: "Converts speech into live captions for full comprehension.",
  },
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "Adaptive Visual Modes",
    desc: "Custom display settings for readability and clarity.",
  },
  {
    icon: <Keyboard className="h-4 w-4" />,
    label: "Keyboard-First Navigation",
    desc: "Full platform control without a mouse.",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Accessible Assessments",
    desc: "Redesigned quizzes that are structured, readable, and navigable.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    label: "Intelligent Content Adaptation",
    desc: "Automatically transforms content into accessible formats.",
  },
];

const stats = [
  { value: "1,000+", label: "Learners Impacted" },
  { value: "91%", label: "Content Lacks Accessibility" },
  { value: "3+", label: "Integration Methods" },
];

export default function About() {
  return (
    <MainLayout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[420px] sm:h-[500px] md:h-[580px] w-full">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1400&auto=format&fit=crop&q=80"
            alt="African students collaborating on accessible learning"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 space-y-4">
            <h1 className="text-[1.65rem] leading-[1.2] sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl">
              90% of online learning platforms{" "}
              <span className="text-gradient">weren't built for everyone.</span>
            </h1>
            <p className="text-[0.88rem] sm:text-base md:text-lg text-white/80 max-w-xl leading-relaxed">
              TERNKONNECT is an AI powered intelligent assistive technology solution
              transforming how people with disabilities experience digital
              learning.
            </p>
            <Link to="/courses">
              <Button className="gradient-primary border-0 text-white font-semibold mt-2 px-6">
                Explore Academy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {/* <section className="bg-card border-b">
        <div className="container max-w-4xl mx-auto px-4 py-6 grid grid-cols-3 divide-x text-center">
          {stats.map(({ value, label }) => (
            <div key={label} className="px-2">
              <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gradient">
                {value}
              </p>
              <p className="text-[0.7rem] sm:text-xs md:text-sm text-muted-foreground mt-0.5 leading-snug">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── Mission split ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="/wc.jpeg"
              alt="African woman studying on a laptop"
              className="w-full h-56 sm:h-72 md:h-80 object-cover"
            />
          </div>
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Our Mission
            </p>
            <h2 className="text-[1.25rem] sm:text-2xl md:text-3xl font-extrabold leading-snug">
              <span className="text-gradient">
                We don’t replace platforms, we transform them into inclusive
                learning experiences.
              </span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              TERNKONNECT embeds accessibility into digital learning platforms,
              enabling inclusive education at scale. So every learner,
              regardless of ability, can fully participate.
            </p>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              Our tagline says it all:{" "}
              <span className="font-semibold text-foreground">
                Leave no one behind.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="py-10 md:py-16 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-[1.15rem] sm:text-2xl font-bold text-center mb-8">
            What Drives Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map(({ icon, title, desc, img, alt }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <img
                  src={img}
                  alt={alt}
                  className="w-full h-40 sm:h-44 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">{icon}</div>
                    <h3 className="font-semibold text-[0.92rem] md:text-base">
                      {title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-[0.8rem] md:text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="/blind.jpeg"
              // src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop&q=80"
              alt="Person with hearing impairment using captions on screen"
              className="w-full h-56 sm:h-72 md:h-80 object-cover"
            />
          </div>
          <div className="space-y-4 w-full">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              The Problem
            </p>
            <h2 className="text-[1.25rem] sm:text-2xl md:text-3xl font-extrabold leading-snug">
              Exclusion is{" "}
              <span className="text-gradient">built into the system</span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              Digital learning is expanding rapidly across Nigeria and beyond,
              yet millions of learners are excluded before they even begin. The
              issue is not their ability to learn, but that most platforms were
              never designed with them in mind.
            </p>
            <ul className="space-y-2.5">
              {[
                "Over 90% of digital learning content lacks basic accessibility features",
                "No sign language support, leaving deaf learners disconnected from content",
                "Limited or no screen reader compatibility, making navigation difficult for visually impaired learners",
                "Little to no adaptive learning, failing to support learners with cognitive differences",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[0.82rem] sm:text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-10 md:py-16 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-[1.15rem] sm:text-2xl font-bold text-center mb-6 md:mb-10">
            Accessibility isn’t added—it’s built in.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {features.map(({ icon, label, desc }) => (
              <div
                key={label}
                className="flex gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="p-2 h-fit rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-[0.85rem] md:text-sm">
                    {label}
                  </p>
                  <p className="text-muted-foreground text-[0.78rem] md:text-sm mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who We Serve ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4">
        <h2 className="text-[1.15rem] sm:text-2xl font-bold text-center mb-8">
          Who We Serve
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              title: "Learners",
              img: "/pic3.jpeg",
              alt: "African students in a learning environment",
              items: [
                "Visually impaired students",
                "Hearing impaired students",
                "Learners with diverse cognitive needs",
              ],
            },
            {
              title: "Institutions",
              img: "/ins.jpeg",
              alt: "African university building",
              items: [
                "Schools and universities",
                "Online learning platforms",
                "Training providers",
              ],
            },
            {
              title: "Partners",
              img: "/pat.jpeg",
              alt: "African professionals collaborating",
              items: [
                "NGOs and inclusion-focused organizations",
                "Governments driving accessible education",
              ],
            },
          ].map(({ title, img, alt, items }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <img
                src={img}
                alt={alt}
                className="w-full h-36 sm:h-40 object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-[0.95rem] md:text-base">
                  {title}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[0.78rem] sm:text-sm text-muted-foreground"
                    >
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Impact CTA ── */}
      <section className="py-10 md:py-16 container max-w-5xl mx-auto px-4 pb-16">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=1200&auto=format&fit=crop&q=80"
            alt="Diverse group of learners with disabilities celebrating success"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
          {/* <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-5 p-6 md:p-10 text-white">
            <div className="space-y-1">
              <p className="text-[1.2rem] sm:text-2xl md:text-3xl font-bold">
                1,000+ Learners Impacted
              </p>
              <p className="text-white/80 text-[0.8rem] sm:text-sm">
                Accessibility should be built into every learning experience.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
              <Link to="/contact" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="font-semibold text-sm w-full"
                >
                  Request a Demo
                </Button>
              </Link>

              <Link to="/courses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="border-white text-black hover:bg-white/10 font-semibold text-sm w-full"
                >
                  Browse Academy
                </Button>
              </Link>
            </div>
          </div> */}
        </div>
      </section>
    </MainLayout>
  );
}
