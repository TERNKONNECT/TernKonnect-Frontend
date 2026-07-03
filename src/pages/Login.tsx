import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  const normalized_email_ref = useRef("");
  // setEmail(normalized);
  // normalized_email_ref.current = normalized;

  const { speak } = useTTS();
  const flowStep = useRef(localStorage.getItem("voice_flow_step") || "idle");
  // const voiceActive =
  //   flowStep.current === "login-email" || flowStep.current === "login-password";
  const voiceActive =
    flowStep.current === "login-email" ||
    flowStep.current === "login-password" ||
    flowStep.current === "login-ready";

  useEffect(() => {
    if (flowStep.current !== "login-email") return;
    setTimeout(() => {
      speak("Please say your email address.");
    }, 800);
  }, []);

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Normalize speech-to-text email: "john at gmail dot com" → "john@gmail.com"
  const normalizeEmail = (val: string) =>
    val
      .toLowerCase()
      .replace(/\s+at\s+/g, "@")
      .replace(/\s+dot\s+/g, ".")
      .replace(/\s/g, "");

  useVoiceCommands(
    [
      // Navigation commands — always active
      {
        command: /(sign up|register|create account)/i,
        action: () => {
          speak("Taking you to the sign up page.");
          localStorage.setItem("voice_flow_step", "signup-name");
          setTimeout(() => navigate("/signup"), 1000);
        },
      },
      {
        command:
          /(change email|update email|wrong email|my email is|email is)/i,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          const extracted = normalizeEmail(
            transcript
              .replace(
                /(change email|update email|wrong email|my email is|email is)/i,
                "",
              )
              .trim(),
          );
          if (isEmail(extracted)) {
            normalized_email_ref.current = extracted;
            setEmail(extracted);
            speak(
              `Email updated to ${extracted}. ${flowStep.current === "login-password" ? "Now say your password." : ""}`,
            );
          } else {
            flowStep.current = "login-email";
            localStorage.setItem("voice_flow_step", "login-email");
            speak("Please say your new email address.");
          }
        },
      },
      {
        command:
          /(change password|update password|wrong password|my password is|password is)/i,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          const extracted = transcript
            .replace(
              /(change password|update password|wrong password|my password is|password is)/i,
              "",
            )
            .trim()
            .replace(/\s/g, "");
          if (extracted) {
            setPassword(extracted);
            speak(`Password updated. Say login to sign in.`);
            flowStep.current = "login-ready";
          } else {
            flowStep.current = "login-password";
            localStorage.setItem("voice_flow_step", "login-password");
            speak("Please say your new password.");
          }
        },
      },
      {
        command: /^(login|log in|sign in|submit|go)$/i,
        action: async () => {
          if (!normalized_email_ref.current || !password) {
            speak("Please provide your email and password first.");
            return;
          }
          speak("Logging you in now.");
          try {
            const user = await login(normalized_email_ref.current, password);
            speak("Welcome back! You are now logged in.");
            localStorage.setItem("voice_flow_step", "ask-course");
            if (user.role === "admin" || user.role === "super-admin") {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          } catch {
            speak("Login failed. Please check your credentials and try again.");
          }
        },
      },
      // Catch-all for email and password input
      {
        command: /.+/,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          if (flowStep.current === "login-email") {
            const normalized = normalizeEmail(transcript);
            if (!isEmail(normalized)) {
              speak(
                "That does not look like a valid email address. Please say your email address again.",
              );
              return;
            }
            normalized_email_ref.current = normalized;
            setEmail(normalized);
            flowStep.current = "login-password";
            localStorage.setItem("voice_flow_step", "login-password");
            speak(
              `Got it. Your email is ${normalized}. Now please say your password.`,
            );
          } else if (flowStep.current === "login-password") {
            const pwd = transcript.replace(/\s/g, "");
            setPassword(pwd);
            flowStep.current = "login-ready";
            localStorage.removeItem("voice_flow_step");
            speak(
              `Password received. Say login to sign in, or say change email or change password to update them.`,
            );
            setTimeout(async () => {
              try {
                const user = await login(normalized_email_ref.current, pwd);
                speak("Welcome back! You are now logged in.");
                localStorage.setItem("voice_flow_step", "ask-course");
                if (user.role === "admin" || user.role === "super-admin") {
                  navigate("/dashboard");
                } else {
                  navigate("/");
                }
              } catch {
                speak(
                  "Login failed. You can say change email or change password to correct them, then say login to try again.",
                );
              }
            }, 1000);
          }
        },
      },
    ],
    voiceActive,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
        duration: 1000,
      });
      if (user.role === "admin" || user.role === "super-admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        toast({
          title: "Email not verified",
          description: "Please verify your email to continue. We've taken you to the verification page.",
          variant: "destructive",
        });
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      toast({
        title: "Error",
        description: err.message || "Invalid credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <Link to="/">
                <BookOpen className="h-6 w-6 text-white" />
              </Link>

            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary border-0 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
