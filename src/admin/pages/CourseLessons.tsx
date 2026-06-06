// src/pages/CourseLessons.tsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { videosApi } from "@/api/videos";
import type { Video } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  title: "",
  description: "",
  duration: "",
  difficulty: "Beginner",
};

const CourseLessons = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [addForm, setAddForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [videoMode, setVideoMode] = useState<"upload" | "youtube">("upload");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (!courseId) return;
    videosApi
      .getAll(courseId)
      .then(setVideos)
      .catch(() => toast.error("Failed to load videos"))
      .finally(() => setLoading(false));
  }, [courseId]);

  // const handleAdd = async () => {
  //   if (!courseId || !addForm.title.trim() || !file)
  //     return toast.error("Title and video file are required");
  //   setSaving(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append("video", file);
  //     fd.append("title", addForm.title);
  //     fd.append("description", addForm.description);
  //     fd.append("duration", addForm.duration);
  //     fd.append("difficulty", addForm.difficulty);
  //     const video = await videosApi.upload(courseId, fd);
  //     setVideos([video, ...videos]);
  //     setAddForm(emptyForm);
  //     setFile(null);
  //     setShowAdd(false);
  //     toast.success("Video uploaded");
  //   } catch {
  //     toast.error("Upload failed");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleAdd = async () => {
    if (!courseId || !addForm.title.trim())
      return toast.error("Title is required");
    if (videoMode === "upload" && !file)
      return toast.error("Please choose a file");
    if (videoMode === "youtube" && !youtubeUrl.trim())
      return toast.error("Please enter a YouTube URL");

    setSaving(true);
    try {
      let video: Video;
      if (videoMode === "upload") {
        const fd = new FormData();
        fd.append("video", file!);
        fd.append("title", addForm.title);
        fd.append("description", addForm.description);
        fd.append("duration", addForm.duration);
        fd.append("difficulty", addForm.difficulty);
        video = await videosApi.upload(courseId, fd);
      } else {
        video = await videosApi.saveYoutube(courseId, {
          ...addForm,
          youtubeUrl,
        });
      }
      setVideos([video, ...videos]);
      setAddForm(emptyForm);
      setFile(null);
      setYoutubeUrl("");
      setShowAdd(false);
      toast.success("Video saved");
    } catch {
      toast.error("Failed to save video");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!courseId) return;
    setSaving(true);
    try {
      const updated = await videosApi.update(courseId, id, editForm);
      setVideos(videos.map((v) => (v._id === id ? updated : v)));
      setEditId(null);
      toast.success("Video updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!courseId || !deleteId) return;
    await videosApi.delete(courseId, deleteId);
    setVideos(videos.filter((v) => v._id !== deleteId));
    setDeleteId(null);
    toast.success("Video deleted");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <CardTitle className="text-base">Add Video</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={videoMode === "upload" ? "default" : "outline"}
                onClick={() => setVideoMode("upload")}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
              <Button
                size="sm"
                variant={videoMode === "youtube" ? "default" : "outline"}
                onClick={() => setVideoMode("youtube")}
              >
                YouTube Link
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              placeholder="Title"
              value={addForm.title}
              onChange={(e) =>
                setAddForm({ ...addForm, title: e.target.value })
              }
            />
            <Input
              placeholder="Description"
              value={addForm.description}
              onChange={(e) =>
                setAddForm({ ...addForm, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Duration (e.g. 10:30)"
                value={addForm.duration}
                onChange={(e) =>
                  setAddForm({ ...addForm, duration: e.target.value })
                }
              />
              <Input
                placeholder="Difficulty"
                value={addForm.difficulty}
                onChange={(e) =>
                  setAddForm({ ...addForm, difficulty: e.target.value })
                }
              />
            </div>
            {/* <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Choose File
              </Button>
              <span className="text-sm text-muted-foreground">
                {file ? file.name : "No file chosen"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="video/mp4,video/webm,video/mkv,video/mov"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div> */}

            {videoMode === "upload" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Choose File
                </Button>
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "No file chosen"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/mkv,video/mov"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            ) : (
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            )}

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving}>
                <Check className="mr-2 h-4 w-4" />
                {saving ? "Uploading..." : "Upload"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdd(false);
                  setFile(null);
                  setAddForm(emptyForm);
                }}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? null : !videos.length ? (
        <EmptyState
          title="No videos yet"
          description="Upload the first video for this course"
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Video
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {videos.map((video) => (
            <Card key={video._id}>
              <CardContent className="p-4">
                {editId === video._id ? (
                  <div className="space-y-2">
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <Input
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={editForm.duration}
                        onChange={(e) =>
                          setEditForm({ ...editForm, duration: e.target.value })
                        }
                      />
                      <Input
                        value={editForm.difficulty}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            difficulty: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(video._id)}
                        disabled={saving}
                      >
                        <Check className="mr-1 h-3 w-3" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditId(null)}
                      >
                        <X className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {video.description}{" "}
                        {video.duration && `· ${video.duration}`} ·{" "}
                        {video.difficulty}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditId(video._id);
                          setEditForm({
                            title: video.title,
                            description: video.description,
                            duration: video.duration,
                            difficulty: video.difficulty,
                          });
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(video._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Video"
        description="This video will be permanently removed."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CourseLessons;
