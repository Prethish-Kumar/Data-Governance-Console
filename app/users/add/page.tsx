import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { addUserAction } from "@/actions/userActions";

export default async function AddUserPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const { success: showSuccess } = (await searchParams) || {};
  const { error: showError } = (await searchParams) || {};

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Add New User</h1>

      {/* SSR Feedback Messages */}
      {showSuccess === "true" && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded shadow-sm">
          User added successfully!
        </div>
      )}
      {showError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded shadow-sm">
          {showError}
        </div>
      )}

      <form action={addUserAction} className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" required />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required />
        </div>

        {/* Roles */}
        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="flex gap-4 flex-wrap">
            {["ADMIN", "EDITOR", "USER"].map((role) => (
              <div key={role} className="flex items-center gap-2">
                <Checkbox id={role} name="roles" value={role} />
                <Label htmlFor={role}>{role}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Link href="/users?page=0">
            <Button variant="outline" type="button" className="cursor-pointer">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="cursor-pointer">
            Add User
          </Button>
        </div>
      </form>
    </div>
  );
}
