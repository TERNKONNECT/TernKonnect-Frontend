import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
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

const InstructorSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.instructorSignup);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { speak } = useTTS();
  const flowStep = useRef(localStorage.getItem("voice_flow_step") || "idle");
  // const voiceActive = [
  //   "signup-name",
  //   "signup-email",
  //   "signup-password",
  // ].includes(flowStep.current);

  const voiceActive = [
    "signup-name",
    "signup-email",
    "signup-password",
    "signup-ready",
  ].includes(flowStep.current);

  const collectedRef = useRef({ name: "", email: "" });

  useEffect(() => {
    if (flowStep.current !== "signup-name") return;
    setTimeout(() => {
      speak("Please say your full name.");
    }, 800);
  }, []);

  const isEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const normalizeEmail = (val: string) =>
    val
      .toLowerCase()
      .replace(/\s+at\s+/g, "@")
      .replace(/\s+dot\s+/g, ".")
      .replace(/\s/g, "");

  useVoiceCommands(
    [
      // Navigation — always active
      {
        command: /(log in|login|sign in|already have an account)/i,
        action: () => {
          speak("Taking you to the login page.");
          localStorage.setItem("voice_flow_step", "login-email");
          setTimeout(() => navigate("/login"), 1000);
        },
      },
      // Change name at any point
      {
        command: /(change name|update name|my name is|name is)/i,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          const extracted = transcript
            .replace(/(change name|update name|my name is|name is)/i, "")
            .trim();
          if (extracted) {
            setName(extracted);
            collectedRef.current.name = extracted;
            speak(`Name updated to ${extracted}.`);
          } else {
            flowStep.current = "signup-name";
            localStorage.setItem("voice_flow_step", "signup-name");
            speak("Please say your new full name.");
          }
        },
      },
      // Change email at any point
      {
        command: /(change email|update email|my email is|email is)/i,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          const extracted = normalizeEmail(
            transcript
              .replace(/(change email|update email|my email is|email is)/i, "")
              .trim(),
          );
          if (isEmail(extracted)) {
            setEmail(extracted);
            collectedRef.current.email = extracted;
            speak(`Email updated to ${extracted}.`);
          } else {
            flowStep.current = "signup-email";
            localStorage.setItem("voice_flow_step", "signup-email");
            speak("Please say your new email address.");
          }
        },
      },
      // Change password at any point
      {
        command:
          /(change password|update password|my password is|password is)/i,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          const extracted = transcript
            .replace(
              /(change password|update password|my password is|password is)/i,
              "",
            )
            .trim()
            .replace(/\s/g, "");
          if (extracted) {
            setPassword(extracted);
            speak(`Password updated. Say sign up to create your account.`);
            flowStep.current = "signup-ready";
          } else {
            flowStep.current = "signup-password";
            localStorage.setItem("voice_flow_step", "signup-password");
            speak("Please say your new password.");
          }
        },
      },
      // Submit command
      {
        command: /^(sign up|register|create account|submit)$/i,
        action: async () => {
          if (
            !collectedRef.current.name ||
            !collectedRef.current.email ||
            !password
          ) {
            speak("Please provide your name, email and password first.");
            return;
          }
          speak("Creating your account now.");
          try {
            await signup(
              collectedRef.current.name,
              collectedRef.current.email,
              password,
            );
            speak("Your account has been created. Welcome to Ternkonnect!");
            navigate("/");
          } catch {
            speak("Sign up failed. Please try again.");
          }
        },
      },
      // Catch-all for step-by-step input
      {
        command: /.+/,
        action: (match) => {
          const transcript = match?.[0] ?? "";
          if (flowStep.current === "signup-name") {
            setName(transcript);
            collectedRef.current.name = transcript;
            flowStep.current = "signup-email";
            localStorage.setItem("voice_flow_step", "signup-email");
            speak(
              `Got it. Your name is ${transcript}. Now please say your email address.`,
            );
          } else if (flowStep.current === "signup-email") {
            const normalized = normalizeEmail(transcript);
            if (!isEmail(normalized)) {
              speak(
                "That does not look like a valid email address. Please say your email address again.",
              );
              return;
            }
            setEmail(normalized);
            collectedRef.current.email = normalized;
            flowStep.current = "signup-password";
            localStorage.setItem("voice_flow_step", "signup-password");
            speak(
              `Got it. Your email is ${normalized}. Now please say your password.`,
            );
          } else if (flowStep.current === "signup-password") {
            const pwd = transcript.replace(/\s/g, "");
            setPassword(pwd);
            flowStep.current = "signup-ready";
            localStorage.removeItem("voice_flow_step");
            speak(
              `Password received. Say sign up to create your account, or say change name, change email, or change password to update them.`,
            );
            setTimeout(async () => {
              try {
                await signup(
                  collectedRef.current.name,
                  collectedRef.current.email,
                  pwd,
                );
                speak("Your account has been created. Welcome to Ternkonnect!");
                navigate("/");
              } catch {
                speak(
                  "Sign up failed. You can say change name, change email, or change password to correct them, then say sign up to try again.",
                );
              }
            }, 1000);
          }
        },
      },
    ],
    voiceActive,
  );

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!name || !email || !password) {
  //     toast({
  //       title: "Error",
  //       description: "Please fill in all fields.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   if (password.length < 6) {
  //     toast({
  //       title: "Error",
  //       description: "Password must be at least 6 characters.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     await signup(name, email, password);
  //     toast({
  //       title: "Account created!",
  //       description: "Welcome to Ternkonnect.",
  //     });
  //     navigate("/");
  //   } catch (err: any) {
  //     toast({
  //       title: "Error",
  //       description: err.message || "Signup failed.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const message = await signup(name, email, password);
      toast({
        title: "Check your email",
        description: message,
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Signup failed.",
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
          <CardTitle className="text-2xl">Become an Instructor</CardTitle>
          <CardDescription>Join our platform and start teaching today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
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
            <Button
              type="submit"
              className="w-full gradient-primary border-0 text-white"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Apply as Instructor"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Log In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorSignup;
