import { useEffect, useState } from "react";
import { profileApi, type AdminProfile } from "@/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Save } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  useEffect(() => {
    profileApi
      .get()
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setTitle(p.title || "");
        setBio(p.bio || "");
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update({ name, title, bio });
      setProfile(updated);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setAvatarProgress(0);
    try {
      const res = await profileApi.uploadAvatar(avatarFile, (pct) =>
        setAvatarProgress(pct),
      );
      setProfile((p) => (p ? { ...p, avatar: res.avatar } : p));
      setAvatarFile(null);
      setAvatarProgress(0);
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!profile)
    return (
      <div className="p-8 text-muted-foreground animate-pulse">Loading...</div>
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      <p className="text-sm text-muted-foreground">
        This information is shown to students on your course pages. mmm
      </p>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="text-xl">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 hover:bg-muted transition-colors text-sm">
              <Upload className="h-4 w-4" />
              {avatarFile ? avatarFile.name : "Choose photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {avatarFile && (
              <div className="space-y-2">
                {uploadingAvatar && (
                  <div className="space-y-1">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${avatarProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {avatarProgress < 100
                        ? `${avatarProgress}%`
                        : "Saving..."}
                    </p>
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Title / Role</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer at Google"
            />
            <p className="text-xs text-muted-foreground">
              Shown below your name on course pages
            </p>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              placeholder="Tell students about yourself, your experience and expertise..."
            />
            <p className="text-xs text-muted-foreground">
              Shown on your course pages
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
