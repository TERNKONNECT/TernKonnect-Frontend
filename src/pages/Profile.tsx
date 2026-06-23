import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Calendar, BookOpen, Award, Trophy, Upload, Save, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuthStore } from "@/stores/authStore";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import { api } from "@/services/api";
import { profileApi, type AdminProfile } from "@/api/profile";
import type { Course } from "@/types";
import { toast } from "sonner";

const achievements = [
  {
    icon: BookOpen,
    label: "First Course",
    desc: "Enrolled in your first course",
  },
  {
    icon: Award,
    label: "Quick Learner",
    desc: "Completed a lesson within 24h",
  },
  { icon: Trophy, label: "Quiz Master", desc: "Scored 100% on a quiz" },
];

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { enrolledCourses } = useEnrollmentStore();
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Settings State
  const [profileData, setProfileData] = useState<AdminProfile | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api.getCourses().then((all) => {
      setCourses(
        all.filter((c) => enrolledCourses.some((e) => e.courseId === c.id)),
      );
    });

    // Fetch full profile for settings
    profileApi
      .get()
      .then((p) => {
        setProfileData(p);
        setName(p.name);
        setTitle(p.title || "");
        setBio(p.bio || "");
      })
      .catch((err) => {
        console.error("Failed to load profile details", err);
      });
  }, [enrolledCourses]);

  const completedCourses = enrolledCourses.filter((e) => e.isCompleted);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await profileApi.update({ name, title, bio });
      setProfileData(updated);
      if (user) {
         setUser({ ...user, name: updated.name });
      }
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
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
      setProfileData(res);
      setAvatarFile(null);
      setAvatarProgress(0);
      if (user) {
        setUser({ ...user, avatar: res.avatar });
      }
      toast.success("Avatar updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

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
      toast.error(err.response?.data?.error || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
               <AvatarImage src={profileData?.avatar || user?.avatar} alt={user?.name} />
               <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
               </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              {profileData?.title && <p className="text-muted-foreground font-medium">{profileData.title}</p>}
              <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user?.joinedAt || "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-4 text-sm pt-1 justify-center sm:justify-start">
                <span>
                  <strong>{enrolledCourses.length}</strong> Enrolled
                </span>
                <span>
                  <strong>{completedCourses.length}</strong> Completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Enrolled Courses</h2>
                {courses.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No courses enrolled yet.{" "}
                      <Link to="/courses" className="text-primary hover:underline">
                        Academy
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => {
                      const e = enrolledCourses.find(
                        (en) => en.courseId === course.id,
                      );
                      const total = course.modules.reduce(
                        (acc, m) => acc + m.lessons.length,
                        0,
                      );
                      const pct =
                        total > 0
                          ? Math.round(
                              ((e?.completedLessons.length || 0) / total) * 100,
                            )
                          : 0;
                      return (
                        <Link key={course.id} to={`/learn/${course.id}`}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="h-14 w-20 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium truncate">
                                  {course.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={pct} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground">
                                    {pct}%
                                  </span>
                                  {e?.isCompleted && (
                                    <Badge variant="secondary" className="text-xs">
                                      Done
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Achievements</h2>
                <div className="space-y-3">
                  {achievements.map((a, i) => {
                    const unlocked = i === 0 && enrolledCourses.length > 0;
                    return (
                      <Card key={i} className={!unlocked ? "opacity-50" : ""}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${unlocked ? "gradient-primary" : "bg-muted"}`}
                          >
                            <a.icon
                              className={`h-5 w-5 ${unlocked ? "text-white" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{a.label}</h3>
                            <p className="text-xs text-muted-foreground">
                              {a.desc}
                            </p>
                          </div>
                          {unlocked && <Badge className="ml-auto">Unlocked</Badge>}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData?.avatar || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
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
                            {avatarProgress < 100 ? `${avatarProgress}%` : "Saving..."}
                          </p>
                        </div>
                      )}
                      <Button size="sm" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                        {uploadingAvatar ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label>Title / Role (Optional)</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Student, Graphic Designer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio (Optional)</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile || !profileData} className="gap-2">
                  <Save className="h-4 w-4" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security Settings
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
                 <Button onClick={handleUpdatePassword} disabled={savingPassword || !currentPassword || !newPassword} variant="destructive" className="gap-2">
                    <Save className="h-4 w-4" />
                    {savingPassword ? "Updating..." : "Update Password"}
                 </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
