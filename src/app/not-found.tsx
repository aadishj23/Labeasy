import { redirect } from "next/navigation";

// Any unknown path redirects to home.
export default function NotFound() {
  redirect("/");
}
