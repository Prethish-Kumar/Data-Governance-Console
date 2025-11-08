import { addUser } from "@/actions/userActions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default async function AddUserPage() {
  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Add New User</h1>
      <form
        action={async (formData: FormData) => {
          "use server";
          await addUser(formData);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required />
        </div>
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

        <div className="flex justify-end gap-2 pt-4">
          <Link href="/users?page=0">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Add User</Button>
        </div>
      </form>
    </div>
  );
}
