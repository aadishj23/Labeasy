import type { Metadata } from "next";
import AdminDashboard from "@/views/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | Labeasy",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
