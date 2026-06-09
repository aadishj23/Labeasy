"use client";
import VendorReviews from "@/components/vendor-reviews";
export default function InsuranceReviews() {
  return (
    <VendorReviews
      endpoint="/api/v1/insurance/reviews"
      note="Reviews will appear here once patients buy and rate your plans."
    />
  );
}
