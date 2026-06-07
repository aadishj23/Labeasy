import type { Metadata } from "next";
import LabBookings from "@/views/LabBookings";

export const metadata: Metadata = {
  title: "Bookings | Labeasy",
  robots: { index: false, follow: false },
};

export default function LabBookingsPage() {
  return <LabBookings />;
}
