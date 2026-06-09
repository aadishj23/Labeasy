"use client";
import VendorReviews from "@/components/vendor-reviews";
export default function LabReviews() {
  return <VendorReviews endpoint="/api/v1/labs/reviews" />;
}
