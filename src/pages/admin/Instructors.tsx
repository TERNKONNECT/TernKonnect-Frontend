import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { superAdminApi, type InstructorSummary } from "@/api/superadmin";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/shared/SkeletonLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronRight,
  BookOpen,
  Users,
  Trophy,
  MailPlus,
} from "lucide-react";
import { toast } from "sonner";

const Instructors = () => {
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    superAdminApi
      .getInstructors()
      .then(setInstructors)
      .catch(() => toast.error("Failed to load instructors"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCourses = instructors.reduce((a, i) => a + i.totalCourses, 0);
  const totalEnrollments = instructors.reduce(
    (a, i) => a + i.totalEnrollments,
    0,
  );

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Enter the admin name and email.");
      return;
    }

    setInviting(true);
    try {
      const result = await superAdminApi.inviteInstructor(
        inviteName.trim(),
        inviteEmail.trim(),
      );
      setInstructors((current) => {
        const withoutExisting = current.filter(
          (item) => item.id !== result.instructor.id,
        );
        return [result.instructor, ...withoutExisting];
      });
      setInviteName("");
      setInviteEmail("");
      setInviteOpen(false);
      toast.success(result.message);
    } catch (error) {
      const apiError =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toast.error(apiError || "Failed to send admin invite");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Course Instructors
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All admins on the platform and their course statistics
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <MailPlus className="h-4 w-4 mr-2" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Name</Label>
                <Input
                  id="invite-name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jane@example.com"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Instructors</p>
              <p className="text-2xl font-bold">{instructors.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <TableSkeleton />
          ) : !filtered.length ? (
            <EmptyState
              title="No instructors found"
              description="No admins have been created yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{instructor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {instructor.email}
                        </p>
                        {instructor.inviteStatus === "pending" && (
                          <Badge variant="outline" className="mt-2">
                            Invite pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {instructor.totalCourses} courses
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {instructor.totalEnrollments}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {instructor.totalCompleted} completed
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="space-y-1">
                        <Progress
                          value={instructor.completionRate}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {instructor.completionRate}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(instructor.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/dashboard/instructors/${instructor.id}`}>
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Instructors;
