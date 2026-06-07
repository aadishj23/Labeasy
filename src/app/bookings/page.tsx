import type { Metadata } from "next";
import Bookings from "@/views/Bookings";

export const metadata: Metadata = {
  title: "My bookings | Labeasy",
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return <Bookings />;
}
