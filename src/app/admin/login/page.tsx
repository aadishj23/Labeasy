import type { Metadata } from "next";
import AdminLogin from "@/views/AdminLogin";

export const metadata: Metadata = {
  title: "Admin sign in | Labeasy",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
