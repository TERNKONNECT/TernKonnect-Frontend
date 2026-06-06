import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

type VerifyStatus = "loading" | "success" | "error";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("This verification link is missing required information.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const query = new URLSearchParams({ token, email });
        const res = await fetch(`${API_URL}/api/auth/verify-email?${query}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "This verification link is invalid or expired.");
        }

        setStatus("success");
        setMessage(data.message || "Email verified. You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "We could not verify your email address.",
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  const icon =
    status === "loading" ? (
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    ) : status === "success" ? (
      <CheckCircle2 className="h-6 w-6 text-green-600" />
    ) : (
      <XCircle className="h-6 w-6 text-destructive" />
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              {status === "loading" ? (
                <MailCheck className="h-6 w-6 text-white" />
              ) : (
                icon
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {status === "success"
              ? "Email verified"
              : status === "error"
                ? "Verification failed"
                : "Verifying email"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "success" ? (
            <Button asChild className="w-full gradient-primary border-0 text-white">
              <Link to="/login">Continue to Login</Link>
            </Button>
          ) : status === "error" ? (
            <Button asChild variant="outline" className="w-full">
              <Link to="/signup">Back to Signup</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
