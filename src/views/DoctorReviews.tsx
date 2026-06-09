"use client";
import VendorReviews from "@/components/vendor-reviews";
export default function DoctorReviews() {
  return <VendorReviews endpoint="/api/v1/doctor/reviews" />;
}
