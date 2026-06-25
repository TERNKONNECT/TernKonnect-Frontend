import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileApi } from "@/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    setSavingPassword(true);
    try {
      await profileApi.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.message || "Failed to update password",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await profileApi.deactivate({ password: deactivatePassword });
      toast.success("Account deactivated");
      logout();
      navigate("/login");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.message || "Failed to deactivate account",
      );
    } finally {
      setDeactivating(false);
      setDeactivatePassword("");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Manage your account security. Edit your name, title, and bio from{" "}
        <a href="/dashboard/profile" className="underline">
          My Profile
        </a>
        .
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button
            onClick={handleUpdatePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deactivating your account will sign you out and prevent future
            logins. Your data is preserved — contact a super admin to
            reactivate.
          </p>
          <div className="space-y-2 max-w-sm">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={deactivating || !deactivatePassword}
            className="gap-2"
          >
            {deactivating ? "Deactivating..." : "Deactivate Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
