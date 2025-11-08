import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Eye, Trash2, RefreshCcw, Plus } from "lucide-react";
import Link from "next/link";
import { getUsers, deleteUser, toggleUserStatus } from "@/actions/userActions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { page: string };
}) {
  const { users, totalPages, isFirst, isLast, pageNumber, size } =
    await getUsers(searchParams);

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      <img
        className="mx-auto w-48"
        src="https://cdn.sanity.io/images/s1vd82jm/production/16b320c118fe2a630aa9855b697c77e082412806-1005x132.svg"
        alt="Logo"
      />

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Users</CardTitle>
          <Button variant="default" asChild>
            <Link href="/users/add">
              <Plus className="w-4 h-4" />
              Add User
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: any, i: number) => (
                    <TableRow key={user.id}>
                      <TableCell>{pageNumber * size + i + 1}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="flex gap-1 flex-wrap">
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
                      </TableCell>
                      <TableCell>
                        {user.status === "ACTIVE" ? (
                          <Badge className="bg-green-500 capitalize">
                            {user.status}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500 capitalize">
                            {user.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.updatedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right flex items-center gap-2">
                        {/* View Button */}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/users/${user.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Link>
                        </Button>

                        {/* Delete Button */}
                        <form
                          action={async () => {
                            "use server";
                            await deleteUser(user.id);
                          }}
                        >
                          <Button size="sm" variant="destructive" type="submit">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </form>

                        {/* Toggle Status Button */}
                        <form
                          action={async () => {
                            "use server";
                            const newStatus =
                              user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                            await toggleUserStatus(user.id, newStatus);
                          }}
                        >
                          <Button
                            size="sm"
                            className="bg-blue-600"
                            type="submit"
                          >
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            {user.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            {isFirst ? (
              <Button variant="outline" disabled>
                Previous
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`?page=${pageNumber - 1}`}>Previous</Link>
              </Button>
            )}

            <p className="text-sm text-muted-foreground">
              Page {pageNumber + 1} of {totalPages}
            </p>

            {isLast ? (
              <Button variant="outline" disabled>
                Next
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={`?page=${pageNumber + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
