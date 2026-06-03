import { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Contrast,
  Link2,
  Type,
  Space,
  PauseCircle,
  ImageOff,
  Spline,
  MousePointer2,
  MessageSquare,
  AlignLeft,
  Droplets,
  ALargeSmall,
} from "lucide-react";
import { isTTSEnabled, setTTSEnabled } from "@/hooks/useTTS";

const STORAGE_KEY = "a11y_prefs";
const PRIMARY_COLOR = "#6366f1";

type State = {
  contrast: boolean;
  highlightLinks: boolean;
  biggerText: boolean;
  textSpacing: boolean;
  pauseAnimations: boolean;
  hideImages: boolean;
  dyslexiaFriendly: boolean;
  largeCursor: boolean;
  tooltips: boolean;
  lineHeight: boolean;
  textAlign: boolean;
  saturation: boolean;
  tts: boolean;
};

const DEFAULTS: State = {
  contrast: false,
  highlightLinks: false,
  biggerText: false,
  textSpacing: false,
  pauseAnimations: false,
  hideImages: false,
  dyslexiaFriendly: false,
  largeCursor: false,
  tooltips: false,
  lineHeight: false,
  textAlign: false,
  saturation: false,
  tts: true,
};

function applyState(s: State) {
  const root = document.documentElement;
  const body = document.body;

  if (s.saturation) root.style.filter = "saturate(0)";
  else if (s.contrast) root.style.filter = "contrast(1.5)";
  else root.style.filter = "";

  const getOrCreate = (id: string) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    return el as HTMLStyleElement;
  };

  getOrCreate("a11y-links-style").textContent = s.highlightLinks
    ? `a { outline: 2px solid ${PRIMARY_COLOR} !important; background: #eef2ff !important; border-radius: 2px; }`
    : "";

  root.style.fontSize = s.biggerText ? "20px" : "";
  root.style.letterSpacing = s.textSpacing ? "0.12em" : "";
  root.style.wordSpacing = s.textSpacing ? "0.16em" : "";

  getOrCreate("a11y-anim-style").textContent = s.pauseAnimations
    ? "*, *::before, *::after { animation-play-state: paused !important; transition: none !important; }"
    : "";

  getOrCreate("a11y-img-style").textContent = s.hideImages
    ? "img, video, iframe { visibility: hidden !important; }"
    : "";

  getOrCreate("a11y-font-style").textContent = s.dyslexiaFriendly
    ? "* { font-family: Arial, sans-serif !important; letter-spacing: 0.05em !important; word-spacing: 0.1em !important; }"
    : "";

  body.style.cursor = s.largeCursor
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 2l16 12-7 1 4 9-3 1-4-9-6 5z' fill='black' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E") 0 0, auto`
    : "";

  root.style.lineHeight = s.lineHeight ? "2" : "";

  getOrCreate("a11y-align-style").textContent = s.textAlign
    ? "p, li, span, div { text-align: left !important; }"
    : "";
}

const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>(DEFAULTS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = { ...DEFAULTS, ...JSON.parse(saved) };
      setState(parsed);
      applyState(parsed);
    } else {
      setTTSEnabled(true);
    }
  }, []);

  // const toggle = (key: keyof State) => {
  //   setState((prev) => {
  //     const next = { ...prev, [key]: !prev[key] };
  //     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  //     if (key === "tts") setTTSEnabled(next.tts);
  //     else applyState(next);
  //     return next;
  //   });
  // };

  const toggle = (key: keyof State) => {
    setState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (key === "tts") {
        setTTSEnabled(next.tts);
        if (!next.tts) {
          // Disabled — stop any ongoing speech
          window.speechSynthesis?.cancel();
        } else {
          // Re-enabled — speak the page summary again
          const summary = [
            document.title,
            document.querySelector("h1")?.innerText,
            document.querySelector("p")?.innerText,
            document.querySelector("main")?.innerText?.slice(0, 300) ||
              document.querySelector("article")?.innerText?.slice(0, 300),
          ]
            .filter(Boolean)
            .join(". ")
            .slice(0, 500);

          if (summary) {
            setTimeout(() => {
              window.speechSynthesis?.cancel();
              const utterance = new SpeechSynthesisUtterance(summary);
              utterance.rate = 1.0;
              window.speechSynthesis?.speak(utterance);
            }, 300);
          }
        }
      } else {
        applyState(next);
      }
      return next;
    });
  };

  const reset = () => {
    setState(DEFAULTS);
    localStorage.removeItem(STORAGE_KEY);
    applyState(DEFAULTS);
    setTTSEnabled(true);
  };

  const cards: { key: keyof State; label: string; icon: React.ReactNode }[] = [
    {
      key: "tts",
      label: "Screen Reader",
      icon: state.tts ? (
        <Volume2 className="h-6 w-6" />
      ) : (
        <VolumeX className="h-6 w-6" />
      ),
    },
    {
      key: "contrast",
      label: "Contrast +",
      icon: <Contrast className="h-6 w-6" />,
    },
    {
      key: "highlightLinks",
      label: "Highlight Links",
      icon: <Link2 className="h-6 w-6" />,
    },
    {
      key: "biggerText",
      label: "Bigger Text",
      icon: <ALargeSmall className="h-6 w-6" />,
    },
    {
      key: "textSpacing",
      label: "Text Spacing",
      icon: <Space className="h-6 w-6" />,
    },
    {
      key: "pauseAnimations",
      label: "Pause Animations",
      icon: <PauseCircle className="h-6 w-6" />,
    },
    {
      key: "hideImages",
      label: "Hide Images",
      icon: <ImageOff className="h-6 w-6" />,
    },
    {
      key: "dyslexiaFriendly",
      label: "Dyslexia Friendly",
      icon: <Type className="h-6 w-6" />,
    },
    {
      key: "largeCursor",
      label: "Cursor",
      icon: <MousePointer2 className="h-6 w-6" />,
    },
    {
      key: "tooltips",
      label: "Tooltips",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      key: "lineHeight",
      label: "Line Height",
      icon: <Spline className="h-6 w-6" />,
    },
    {
      key: "textAlign",
      label: "Text Align",
      icon: <AlignLeft className="h-6 w-6" />,
    },
    {
      key: "saturation",
      label: "Saturation",
      icon: <Droplets className="h-6 w-6" />,
    },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Accessibility settings"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
      >
        <img src="/Accessibility.png" alt="accessible" />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-card text-card-foreground rounded-2xl shadow-2xl w-72 max-w-[calc(100vw-32px)] max-h-[80vh] flex flex-col mb-16 pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-card z-10 rounded-t-2xl">
              <span className="font-bold text-sm">Accessibility</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  aria-label="Reset all"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Cards grid — scrollable */}
            <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto flex-1">
              {cards.map(({ key, label, icon }) => {
                const active = state[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    aria-pressed={active}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all hover:shadow-md ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {icon}
                    <span className="text-[0.72rem] font-medium leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-4 py-3 flex items-center justify-between rounded-b-2xl flex-shrink-0">
              <a
                href="https://ternkonnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 no-underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <defs>
                    <linearGradient
                      id="tkw-react-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
                    stroke="url(#tkw-react-grad)"
                  />
                  <path
                    d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
                    stroke="url(#tkw-react-grad)"
                  />
                </svg>
                <div>
                  <p className="text-[11px] font-bold text-primary leading-tight">
                    TERNKONNECT
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    Accessibility Widget
                  </p>
                </div>
              </a>
              <a
                href="https://ternkonnect.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div>
                  <p className="text-[11px] font-bold text-primary leading-tight">
                    Powered By
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-tight">
                    TERNKONNECT
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityWidget;
