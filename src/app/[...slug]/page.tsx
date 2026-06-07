import { redirect } from "next/navigation";

// Any path that doesn't match a defined route lands here -> send home.
export default function CatchAll() {
  redirect("/");
}
