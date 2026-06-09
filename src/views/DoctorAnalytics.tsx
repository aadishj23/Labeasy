"use client";
import VendorAnalytics from "@/components/vendor-analytics";
export default function DoctorAnalytics() {
  return (
    <VendorAnalytics
      endpoint="/api/v1/doctor/analytics"
      title="Analytics"
      chartLabel="Consult revenue (₹)"
      includeToggle={{
        label: "Include off-platform (manual) consults",
        add: { appointments: "offPlatformConsults", revenue: "offPlatformGmv" },
      }}
      stats={[
        { key: "appointments", label: "Appointments" },
        { key: "completed", label: "Completed" },
        { key: "upcoming", label: "Upcoming" },
        { key: "cancelled", label: "Cancelled" },
        { key: "revenue", label: "Consult revenue", money: true, hint: "On-platform (gross)" },
        { key: "balance", label: "Wallet balance", money: true },
      ]}
    />
  );
}
