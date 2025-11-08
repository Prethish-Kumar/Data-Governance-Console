import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect immediately on server side
  redirect("/users?page=0");
}
