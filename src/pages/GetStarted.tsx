import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen, Check, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAILJS_SERVICE_ID = "service_whpb5nk";
const EMAILJS_TEMPLATE_ID = "template_ievh3os";
const EMAILJS_PUBLIC_KEY = "uE2eanzlj-GmJ2UKf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

const steps = [
  {
    title: "Getting to Know You",
    desc: "A few quick words about you will help us get started!",
  },
  {
    title: "Choose your Accessibility Plan",
    desc: "Maximize digital accessibility with pricing tailored to your organization.",
  },
];

const trustedBrands = [
  "Payoneer",
  "Fujitsu",
  "Nielsen",
  "The Motley Fool",
  "Centrum",
  "ThermoFisher",
];

// const plans = [
//   {
//     id: "trial",
//     label: "7-Day Free Trial",
//     badge: "Free",
//     badgeColor: "bg-green-500",
//     price: 0,
//     period: "/7 days",
//     billing: "No credit card required",
//     discount: "Full access for 7 days, cancel anytime.",
//   },
//   {
//     id: "monthly",
//     label: "Monthly Subscription",
//     badge: null,
//     badgeColor: "",
//     price: 49,
//     period: "/month",
//     billing: "Billed monthly at $49",
//     discount: "",
//   },
//   {
//     id: "annual",
//     label: "Annual Subscription",
//     badge: "Popular",
//     badgeColor: "bg-primary",
//     price: 41,
//     period: "/month",
//     billing: "Billed as one payment of $490",
//     discount: "16% off the monthly subscription!",
//   },
//   {
//     id: "biennial",
//     label: "2-Year Subscription",
//     badge: "Best value",
//     badgeColor: "bg-purple-500",
//     price: 38,
//     period: "/month",
//     billing: "Billed as one payment of $901.6",
//     discount: "23% off the monthly subscription!",
//   },
// ];

const plans = [
  {
    id: "trial",
    label: "7-Day Free Trial",
    badge: "Free",
    badgeColor: "bg-green-500",
    price: 0,
    period: "/7 days",
    billing: "No credit card required",
    discount: "Full access for 7 days, cancel anytime.",
  },
  {
    id: "standard",
    label: "Standard",
    badge: null,
    badgeColor: "",
    price: 12,
    period: "/month",
    billing: "Billed monthly at $12",
    discount: "Basic accessibility features for your website.",
  },
  {
    id: "premium",
    label: "Premium",
    badge: "Popular",
    badgeColor: "bg-primary",
    price: 25,
    period: "/month",
    billing: "Billed monthly at $25",
    discount: "Full compliance, 24/7 auto code fixes & legal protection.",
  },
];

export default function GetStarted() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", website: "" });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState("trial");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    if (!form.website.trim()) errs.website = "Website URL is required";
    if (!agreed) errs.agreed = "You must agree to the terms";
    return errs;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const sendTrialEmail = async () => {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          user_name: form.name,
          user_email: form.email,
          user_website: form.website,
        },
        EMAILJS_PUBLIC_KEY,
      );
    } catch (err) {
      throw err;
    }
  };

  const handleStep2Submit = async () => {
    setSending(true);
    setEmailError("");
    try {
      // Save to database for all plans
      const res = await fetch(`${API_URL}/api/get-started`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          website: form.website,
          plan: selectedPlan,
        }),
      });
      if (!res.ok) throw new Error("Failed to save signup");

      // Send confirmation email for trial plan
      if (selectedPlan === "trial") {
        await sendTrialEmail();
      }

      setSubmitted(true);
    } catch (err) {
      setEmailError("Failed to submit. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ── Left panel ──
  const LeftPanel = () => (
    <div className="w-full md:w-[420px] md:min-h-screen bg-gradient-to-b from-[#eef2ff] to-[#f5f3ff] flex flex-col px-10 py-12 flex-shrink-0">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-16">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-gradient">TERNKONNECT</span>
      </Link>

      <div className="space-y-8 mb-auto">
        {steps.map((s, i) => {
          const isCompleted = i + 1 < step;
          const isActive = i + 1 === step;
          return (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    isCompleted || isActive
                      ? "gradient-primary text-white"
                      : "border-2 border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 transition-all ${isCompleted ? "bg-primary" : "bg-muted-foreground/20"}`}
                  />
                )}
              </div>
              <div className="pt-1">
                <p
                  className={`font-semibold text-sm ${isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {s.title}
                </p>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* <div className="mt-16">
        <p className="text-xs font-semibold text-muted-foreground mb-4">
          Trusted by world leading brands:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {trustedBrands.map((brand) => (
            <div
              key={brand}
              className="bg-white rounded-lg px-2 py-2 text-[10px] font-semibold text-muted-foreground text-center border"
            >
              {brand}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );

  // ── Success state ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <LeftPanel />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center space-y-4 max-w-md">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">You're all set!</h2>
            <p className="text-muted-foreground text-sm">
              Thanks,{" "}
              <span className="font-medium text-foreground">{form.name}</span>!{" "}
              {selectedPlan === "trial"
                ? "Your 7-day free trial is now active. Check your email at "
                : "We've received your details. Check your email at "}
              <span className="font-medium text-foreground">{form.email}</span>
              {selectedPlan === "trial"
                ? " for your getting started guide."
                : " shortly."}
            </p>
            <Link to="/">
              <Button className="gradient-primary border-0 text-white mt-4">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <LeftPanel />

      <div className="flex-1 flex flex-col px-6 py-12">
        {/* Step 1 */}
        {step === 1 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <h1 className="text-2xl font-bold mb-2">Get started for free</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your details below to activate your free trial.
              </p>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Full name <span className="text-red-500">(required)</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    className={`h-12 ${errors.name ? "border-red-400" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Email address{" "}
                    <span className="text-red-500">(required)</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`h-12 ${errors.email ? "border-red-400" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="website"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                  >
                    Website URL <span className="text-red-500">(required)</span>
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://yourwebsite.com"
                    value={form.website}
                    onChange={handleChange}
                    className={`h-12 ${errors.website ? "border-red-400" : ""}`}
                  />
                  {errors.website && (
                    <p className="text-xs text-red-500">{errors.website}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        setErrors((p) => ({ ...p, agreed: "" }));
                      }}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the TERNKONNECT{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms of use
                      </Link>{" "}
                      &{" "}
                      <Link
                        to="/privacy-policy"
                        className="text-primary hover:underline"
                      >
                        Privacy policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreed && (
                    <p className="text-xs text-red-500 ml-7">{errors.agreed}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="gradient-primary border-0 text-white w-full gap-2 h-12 text-base font-semibold"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-xl">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Previous step
              </button>

              <div className="text-center mb-2">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Select Your <span className="text-primary">PRO</span>{" "}
                  Subscription Based on Your Website
                </h2>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-8">
                <span>Free for 7 days</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>Start now, pay in 7 days</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span>Cancel anytime</span>
              </div>

              <div className="space-y-3 mb-8">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {plan.badge && (
                        <span
                          className={`absolute -top-3 left-4 text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${plan.badgeColor}`}
                        >
                          {plan.badge}
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-primary"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {plan.label}
                            </p>
                            {plan.discount && (
                              <p
                                className={`text-xs mt-0.5 ${plan.id === "trial" ? "text-green-600" : "text-primary"}`}
                              >
                                {plan.discount}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-lg">
                            {plan.price === 0 ? (
                              <span className="text-2xl text-green-600">
                                Free
                              </span>
                            ) : (
                              <>
                                <span className="text-2xl">${plan.price}</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                  {plan.period}
                                </span>
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {plan.billing}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {emailError && (
                <p className="text-sm text-red-500 text-center mb-4">
                  {emailError}
                </p>
              )}

              <Button
                onClick={handleStep2Submit}
                disabled={sending}
                size="lg"
                className="gradient-primary border-0 text-white w-full gap-2 h-12 text-base font-semibold"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 mt-6 bg-muted/50 rounded-xl p-3">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">FREE</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Looking for the free widget?{" "}
                  <a
                    href="https://ternkonnect-widget.vercel.app"
                    target="_blank"
                    rel="noopener"
                    className="text-primary font-medium hover:underline"
                  >
                    Get it here.
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
