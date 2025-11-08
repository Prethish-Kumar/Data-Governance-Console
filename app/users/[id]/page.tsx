import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, RefreshCw, RefreshCcw } from "lucide-react";
import { notFound } from "next/navigation";

import {
  getUserById,
  getUserPreferences,
  getUserPosts,
  toggleUserStatus,
  deleteUser,
} from "@/actions/userActions";

export default async function UserPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [user, prefs, posts] = await Promise.all([
    getUserById(id),
    getUserPreferences(id),
    getUserPosts(id),
  ]);

  if (!user) return notFound();

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      {/* 🔙 Back + Actions */}
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/users?page=0" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </Button>

        <form
          action={async () => {
            "use server";
            if (user.status === "ACTIVE") {
              return toggleUserStatus(id, "INACTIVE");
            } else {
              return toggleUserStatus(id, "ACTIVE");
            }
          }}
          className="flex items-center gap-2"
        >
          <Button size="sm" className="bg-blue-600" type="submit">
            <RefreshCcw className="h-4 w-4 mr-1" />
            {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </form>
        <form
          action={async () => {
            "use server";
            return deleteUser(id);
          }}
        >
          <Button size="sm" variant="destructive" type="submit">
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </form>
      </div>

      {/* 👤 USER INFO */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            {user.name}
            {user.status === "ACTIVE" ? (
              <Badge className="bg-green-500 capitalize">{user.status}</Badge>
            ) : (
              <Badge className="bg-red-500 capitalize">{user.status}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <div className="flex flex-wrap gap-1">
            <strong>Roles:</strong>
            {user.roles.map((r: string) => (
              <Badge
                key={r}
                variant={
                  r === "ADMIN"
                    ? "destructive"
                    : r === "EDITOR"
                    ? "secondary"
                    : "outline"
                }
              >
                {r}
              </Badge>
            ))}
          </div>
          <p>
            <strong>Created:</strong>{" "}
            {format(new Date(user.createdAt), "MMM d, yyyy")}
          </p>
          <p>
            <strong>Updated:</strong>{" "}
            {format(new Date(user.updatedAt), "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>

      {/* ⚙️ USER PREFERENCES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {!prefs ? (
            <p className="text-muted-foreground">No preferences found</p>
          ) : (
            <>
              <p>
                <strong>Theme:</strong> {prefs.theme}
              </p>
              <p>
                <strong>Language:</strong> {prefs.language}
              </p>
              <p>
                <strong>Notifications:</strong>{" "}
                {prefs.notificationsEnabled ? "Enabled" : "Disabled"}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {format(new Date(prefs.updatedAt), "MMM d, yyyy")}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* 🧾 USER POSTS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {!posts || posts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No posts found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      {format(new Date(p.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(p.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 📜 AUDIT TRAIL */}
      {user.auditTrail?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.auditTrail.map((log: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.performedBy}</TableCell>
                    <TableCell>
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
