import { useEffect, useState } from 'react';
import { usersApi } from '@/api/users';
import type { User } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { Search, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      <h1 className="text-2xl font-bold text-foreground">Users</h1>

      <Card>
        <CardContent className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          {loading ? <TableSkeleton /> : !users.length ? (
            <EmptyState title="No users found" description="No users match your search criteria" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.enrolledCourses.length} courses</TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? 'destructive' : 'default'}>{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleBlock(user._id)} title={user.isBlocked ? 'Unblock' : 'Block'}>
                        {user.isBlocked ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <ShieldBan className="h-4 w-4 text-amber-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(user._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete User" description="This will permanently delete this user and all their data." onConfirm={handleDelete} />
    </div>
  );
};

export default Users;
