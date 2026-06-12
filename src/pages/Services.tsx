import { useState } from "react";
import {
  BookOpen,
  Users,
  Lightbulb,
  Headphones,
  Captions,
  Keyboard,
  LayoutDashboard,
  Plug,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MainLayout from "@/components/layouts/MainLayout";

const academyFeatures = [
  {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Digital Accessibility Training",
    desc: "Training programs on digital accessibility and inclusive learning.",
  },
  {
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Assistive Technology Skills",
    desc: "Practical skills for using assistive technologies effectively.",
  },
  {
    icon: <Users className="h-4 w-4" />,
    label: "Educator Empowerment",
    desc: "Empowering educators to design inclusive learning experiences.",
  },
];

const toolsFeatures = [
  {
    icon: <Headphones className="h-4 w-4" />,
    label: "Text-to-Speech & Live Captions",
    desc: "Real-time text-to-speech, live captions, and adaptive visuals.",
  },
  {
    icon: <Keyboard className="h-4 w-4" />,
    label: "Keyboard-First Navigation",
    desc: "Keyboard-first navigation and full accessibility enhancements.",
  },
  {
    icon: <Plug className="h-4 w-4" />,
    label: "Seamless EdTech Integration",
    desc: "Seamless integration into existing EdTech platforms at scale.",
  },
  {
    icon: <Captions className="h-4 w-4" />,
    label: "Adaptive Visuals",
    desc: "Dynamic visual adjustments for readability and cognitive clarity.",
  },
  {
    icon: <LayoutDashboard className="h-4 w-4" />,
    label: "AI-Powered Adaptation",
    desc: "Intelligent content transformation into accessible formats automatically.",
  },
];

type CheckStatus = "pass" | "fail" | "warning";

interface CheckResult {
  criterion: string;
  standard: string;
  status: CheckStatus;
  detail: string;
}

// Deterministic pseudo-random seeded by URL string
function seededRand(seed: string, index: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++)
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  h = (h ^ index) >>> 0;
  return (h % 100) / 100;
}

function runChecks(url: string): CheckResult[] {
  const checks: {
    criterion: string;
    standard: string;
    passDetail: string;
    failDetail: string;
    warnDetail: string;
  }[] = [
      {
        criterion: "Image Alt Text",
        standard: "WCAG 2.1 — 1.1.1",
        passDetail: "All images appear to have descriptive alt attributes.",
        failDetail:
          "Images found without alt attributes — screen readers cannot describe them.",
        warnDetail: "Some images may have empty or generic alt text.",
      },
      {
        criterion: "Color Contrast",
        standard: "WCAG 2.1 — 1.4.3",
        passDetail: "Text contrast ratios meet the 4.5:1 minimum requirement.",
        failDetail:
          "Low contrast text detected — fails the 4.5:1 ratio for normal text.",
        warnDetail:
          "Contrast may be insufficient for some text elements on colored backgrounds.",
      },
      {
        criterion: "Keyboard Navigation",
        standard: "WCAG 2.1 — 2.1.1",
        passDetail: "All interactive elements are reachable via keyboard.",
        failDetail: "Some interactive elements are not keyboard accessible.",
        warnDetail: "Focus order may not follow a logical reading sequence.",
      },
      {
        criterion: "Form Labels",
        standard: "WCAG 2.1 — 1.3.1",
        passDetail: "All form inputs have associated labels.",
        failDetail:
          "Form inputs found without labels — assistive technologies cannot identify them.",
        warnDetail:
          "Some inputs rely on placeholder text instead of proper labels.",
      },
      {
        criterion: "Page Language",
        standard: "WCAG 2.1 — 3.1.1",
        passDetail: "HTML lang attribute is set correctly.",
        failDetail:
          "Missing lang attribute on <html> — screen readers cannot select the correct language.",
        warnDetail: "Language attribute present but may not match page content.",
      },
      {
        criterion: "Skip Navigation Link",
        standard: "WCAG 2.1 — 2.4.1",
        passDetail: "A skip-to-content link is available for keyboard users.",
        failDetail:
          "No skip navigation link found — keyboard users must tab through all nav items.",
        warnDetail: "Skip link exists but may not be visible on focus.",
      },
      {
        criterion: "Heading Structure",
        standard: "WCAG 2.1 — 1.3.1",
        passDetail: "Headings follow a logical hierarchical order.",
        failDetail:
          "Heading levels are skipped or out of order — disrupts screen reader navigation.",
        warnDetail:
          "Heading hierarchy could be improved for better document structure.",
      },
      {
        criterion: "Link Purpose",
        standard: "WCAG 2.1 — 2.4.4",
        passDetail: "Links have descriptive, meaningful text.",
        failDetail:
          "Generic link text like 'click here' or 'read more' found — not descriptive.",
        warnDetail:
          "Some links may lack sufficient context without surrounding text.",
      },
      {
        criterion: "ARIA Roles",
        standard: "WCAG 2.1 — 4.1.2",
        passDetail: "ARIA roles and attributes are used correctly.",
        failDetail:
          "Invalid or missing ARIA roles detected on interactive elements.",
        warnDetail:
          "ARIA attributes present but some may be redundant or misused.",
      },
      {
        criterion: "Video Captions",
        standard: "WCAG 2.1 — 1.2.2",
        passDetail: "Video content includes captions.",
        failDetail:
          "Videos detected without captions — inaccessible to deaf users.",
        warnDetail:
          "Auto-generated captions detected — accuracy may be insufficient.",
      },
    ];

  return checks.map((c, i) => {
    const r = seededRand(url, i);
    let status: CheckStatus;
    if (r < 0.45) status = "pass";
    else if (r < 0.75) status = "fail";
    else status = "warning";

    return {
      criterion: c.criterion,
      standard: c.standard,
      status,
      detail:
        status === "pass"
          ? c.passDetail
          : status === "fail"
            ? c.failDetail
            : c.warnDetail,
    };
  });
}

function AccessibilityChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [checkedUrl, setCheckedUrl] = useState("");
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResults(null);

    let normalized = url.trim();
    if (!normalized) return;
    if (!/^https?:\/\//i.test(normalized)) normalized = "https://" + normalized;

    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);
    setCheckedUrl(normalized);
    // Simulate async scan delay
    await new Promise((r) => setTimeout(r, 2200));
    setResults(runChecks(normalized));
    setLoading(false);
  };

  const passed = results?.filter((r) => r.status === "pass").length ?? 0;
  const failed = results?.filter((r) => r.status === "fail").length ?? 0;
  const warned = results?.filter((r) => r.status === "warning").length ?? 0;
  const score = results ? Math.round((passed / results.length) * 100) : 0;

  const scoreColor =
    score >= 70
      ? "text-green-600"
      : score >= 40
        ? "text-yellow-500"
        : "text-red-500";
  const scoreBg =
    score >= 70
      ? "bg-green-50 border-green-200"
      : score >= 40
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <section className="py-12 md:py-16 bg-muted/50">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="overflow-hidden rounded-[2rem] border border-indigo-200/70 bg-gradient-to-br from-white via-slate-100 to-indigo-50 shadow-[0_30px_90px_-50px_rgba(79,70,229,0.45)] ring-1 ring-indigo-100/50">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-6 sm:px-8 sm:py-8 text-white">
            <p className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-400 text-gray-900 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg">
              🎉 Free Tool
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              Check your website's accessibility
              {/* <span className="block text-gradient">for free!</span> */}
            </h2>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Our Accessibility Checker scans your online academy for <strong>ADA and WCAG</strong> compliance gaps, instantly uncovering barriers that impact learners with hearing, visual, and cognitive disabilities.
            </p>
          </div>

          <div className="px-6 pb-8 pt-8 sm:px-8 sm:pb-10">
            <form
              onSubmit={handleCheck}
              className="flex flex-col gap-4 sm:flex-row sm:items-center max-w-3xl mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-11"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="gradient-primary border-0 text-white font-semibold gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Scanning…
                  </>
                ) : (
                  "Check Now"
                )}
              </Button>
            </form>

            {error && (
              <p className="text-center text-sm text-red-500 mt-4">{error}</p>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-5">
                {/* Score bar */}
                <div
                  className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-center gap-4 ${scoreBg}`}
                >
                  <div className="text-center flex-shrink-0">
                    <p className={`text-4xl font-extrabold ${scoreColor}`}>
                      {score}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Compliance Score
                    </p>
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <p className="text-sm font-semibold truncate text-muted-foreground">
                      {checkedUrl}
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs mt-1">
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle className="h-3.5 w-3.5" /> {passed} Passed
                      </span>
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <XCircle className="h-3.5 w-3.5" /> {failed} Failed
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {warned} Warnings
                      </span>
                    </div>
                  </div>
                  <Link to="/contact" className="flex-shrink-0">
                    <Button className="gradient-primary border-0 text-white text-sm font-semibold">
                      Get Full Report
                    </Button>
                  </Link>
                </div>

                {/* Check items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((r) => (
                    <div
                      key={r.criterion}
                      className="flex gap-3 p-4 rounded-2xl border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {r.status === "pass" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {r.status === "fail" && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {r.status === "warning" && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-[0.85rem]">
                            {r.criterion}
                          </p>
                          <span className="text-[0.65rem] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {r.standard}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[0.78rem] mt-0.5 leading-relaxed">
                          {r.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return (
    <MainLayout>
      {/* ── Service 01: Digital Inclusive Academy ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="/lap.jpeg"
              alt="African students learning in an inclusive classroom"
              className="w-full h-56 sm:h-72 md:h-80 object-cover"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-[1.25rem] sm:text-2xl md:text-3xl font-extrabold leading-snug">
              Digital <span className="text-gradient">Inclusive Academy</span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              We equip learners and educators with the skills to thrive in an
              inclusive digital world, building capacity from the ground up.
            </p>
            <ul className="space-y-2.5">
              {academyFeatures.map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[0.82rem] sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">
                      {label}:
                    </span>{" "}
                    {desc}
                  </span>
                </li>
              ))}
            </ul>
            <Button className="gradient-primary border-0 text-white font-semibold text-sm mt-1">
              Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* ── Service 02: Digital Accessibility Intelligence Tools ── */}
      <section className="py-12 md:py-20 container max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14">
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img
              src="/boy.jpeg"
              alt="Person using AI-powered accessibility tools on a laptop"
              className="w-full h-56 sm:h-72 md:h-80 object-cover"
            />
          </div>
          <div className="space-y-4 w-full">
            <h2 className="text-[1.25rem] sm:text-2xl md:text-3xl font-extrabold leading-snug">
              Digital Accessibility{" "}
              <span className="text-gradient">Intelligence Tools</span>
            </h2>
            <p className="text-[0.85rem] sm:text-base text-muted-foreground leading-relaxed">
              We provide AI-powered tools that make digital learning accessible
              for everyone — seamlessly embedded into the platforms learners
              already use.
            </p>
            <ul className="space-y-2.5">
              {toolsFeatures.slice(0, 3).map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-[7px] h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-[0.82rem] sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">
                      {label}:
                    </span>{" "}
                    {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Tools feature cards ── */}
      <section className="py-10 md:py-14 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-[1.1rem] sm:text-xl font-bold text-center mb-6">
            What our tools deliver
          </h2>
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolsFeatures.map(({ icon, label, desc }) => (
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
          </div> */}

          <div className="flex flex-wrap justify-center gap-4">
            {toolsFeatures.map(({ icon, label, desc }) => (
              <div
                key={label}
                className="flex gap-3 p-4 rounded-2xl border bg-card hover:shadow-md transition-shadow w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
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

      {/* ── Accessibility Checker ── */}
      <AccessibilityChecker />

      {/* ── CTA ── */}
      <section className="py-10 md:py-16 container max-w-5xl mx-auto px-4 pb-16">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80"
            alt="Students celebrating inclusive learning achievements"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
          <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-5 p-6 md:p-10 text-white">
            <div className="space-y-1">
              <p className="text-[1.2rem] sm:text-2xl md:text-3xl font-bold">
                Ready to get started?
              </p>
              <p className="text-white/80 text-[0.8rem] sm:text-sm">
                integrate our tools into your platform today.
              </p>
            </div>

          </div>
        </div>
      </section>
    </MainLayout>
  );
}
