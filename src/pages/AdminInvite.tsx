import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { superAdminApi } from "@/services/superadmin";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

type ApiUser = Omit<User, "id" | "joinedAt"> & {
  _id?: string;
  id?: string;
  createdAt?: string;
  joinedAt?: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const toAppUser = (user: ApiUser): User => ({
  id: user.id ?? user._id ?? "",
  name: user.name,
  email: user.email,
  role: user.role,
  avatar:
    user.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      user.name,
    )}`,
  joinedAt: user.joinedAt ?? user.createdAt ?? new Date().toISOString(),
});

const AdminInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => password.length >= 6 && password === confirmPassword && !submitting,
    [confirmPassword, password, submitting],
  );

  useEffect(() => {
    let active = true;

    const verifyInvite = async () => {
      if (!token || !email) {
        setError("This invitation link is missing required details.");
        setChecking(false);
        return;
      }

      try {
        const invite = await superAdminApi.verifyAdminInvite(token, email);
        if (!active) return;
        setName(invite.name);
      } catch (err: unknown) {
        if (!active) return;
        setError(getErrorMessage(err, "Invalid or expired invitation link."));
      } finally {
        if (active) setChecking(false);
      }
    };

    verifyInvite();

    return () => {
      active = false;
    };
  }, [email, token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await superAdminApi.acceptAdminInvite(
        token,
        email,
        password,
      );
      const user = toAppUser(result.user as ApiUser);

      useAuthStore.setState({
        user,
        token: result.token,
        isAuthenticated: true,
      });
      localStorage.setItem("lms_token", result.token);
      localStorage.setItem("lms_user", JSON.stringify(user));

      toast.success(result.message || "Password created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <CardTitle>Create your password</CardTitle>
            <CardDescription>
              Complete your staff invitation to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checking ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking invitation...
              </div>
            ) : error ? (
              <div className="space-y-5 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Invitation verified
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {name ? `${name} - ${email}` : email}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  {submitting ? "Creating..." : "Create password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInvite;
