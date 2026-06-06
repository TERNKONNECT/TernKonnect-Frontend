import { useEffect, useState } from 'react';
import { usersApi } from '@/api/users';
import type { AdminUser as User } from '@/types/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Search, ShieldBan, ShieldCheck, Trash2, Users as UsersIcon, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = currentUser?.role === 'super-admin';

  useEffect(() => {
    usersApi.getAll(search).then(setUsers).finally(() => setLoading(false));
  }, [search]);

  const handleToggleBlock = async (id: string) => {
    try {
      const updated = await usersApi.toggleBlock(id);
      setUsers(users.map((u) => (u._id === id ? updated : u)));
      toast.success(updated.isBlocked ? 'User blocked' : 'User unblocked');
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await usersApi.delete(deleteId);
    setUsers(users.filter((u) => u._id !== deleteId));
    setDeleteId(null);
    toast.success('User deleted');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {isSuperAdmin ? (
            <UsersIcon className="h-6 w-6 text-muted-foreground" />
          ) : (
            <GraduationCap className="h-6 w-6 text-muted-foreground" />
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {isSuperAdmin ? 'All Platform Users' : 'Students in My Courses'}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          {isSuperAdmin
            ? 'All registered learners across the entire platform'
            : 'Learners who have enrolled in one or more of your courses'}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isSuperAdmin ? 'Search all users...' : 'Search students...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {!loading && (
            <p className="text-xs text-muted-foreground mb-3">
              {users.length} {isSuperAdmin ? 'user' : 'student'}{users.length !== 1 ? 's' : ''} found
            </p>
          )}

          {loading ? (
            <TableSkeleton />
          ) : !users.length ? (
            <EmptyState
              title={isSuperAdmin ? 'No users found' : 'No students yet'}
              description={
                isSuperAdmin
                  ? 'No users match your search criteria'
                  : 'Students will appear here once they enroll in your courses'
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{isSuperAdmin ? 'Enrolled Courses' : 'Enrolled In'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold uppercase">
                            {user.name?.[0] ?? '?'}
                          </div>
                        )}
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.enrolledCourses.length} course{user.enrolledCourses.length !== 1 ? 's' : ''}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? 'destructive' : 'default'}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleBlock(user._id)}
                          title={user.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {user.isBlocked ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ShieldBan className="h-4 w-4 text-amber-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(user._id)} title="Delete user">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete User"
        description="This will permanently delete this user and all their data. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Users;
