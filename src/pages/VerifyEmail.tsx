import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, KeyRound, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";
const RESEND_COOLDOWN_SECONDS = 30;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(searchParams.get("email")?.trim() || "");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast({
        title: "Error",
        description: "Please enter your email and the verification code.",
        variant: "destructive",
      });
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invalid or expired verification code.");
      setVerified(true);
      toast({ title: "Email verified", description: data.message || "You can now log in." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Verification failed.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email first.",
        variant: "destructive",
      });
      return;
    }
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to resend verification code.");
      toast({ title: "Code sent", description: data.message || "Check your inbox for a new code." });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to resend code.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              {verified ? (
                <CheckCircle2 className="h-6 w-6 text-white" />
              ) : (
                <MailCheck className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {verified ? "Email verified" : "Verify your email"}
          </CardTitle>
          <CardDescription>
            {verified
              ? "Your email has been verified. You can now log in."
              : "Enter the 6-digit code we sent to your email address."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified ? (
            <Button
              className="w-full gradient-primary border-0 text-white"
              onClick={() => navigate("/login")}
            >
              Continue to Login
            </Button>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
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
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    className="pl-9 tracking-widest"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary border-0 text-white"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify Email"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : resending
                    ? "Sending..."
                    : "Didn't receive a code? Resend"}
              </button>
            </form>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
