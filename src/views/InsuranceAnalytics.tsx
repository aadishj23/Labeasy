"use client";
import VendorAnalytics from "@/components/vendor-analytics";
export default function InsuranceAnalytics() {
  return (
    <VendorAnalytics
      endpoint="/api/v1/insurance/analytics"
      title="Analytics"
      chartLabel="Net earnings (₹)"
      includeToggle={{
        label: "Include off-platform conversions in total sales",
        add: { sales: "offPlatformSales", gross: "offPlatformGmv" },
      }}
      stats={[
        { key: "sales", label: "Total sales" },
        { key: "gross", label: "Sales GMV", money: true },
        { key: "net", label: "Net earnings", money: true, hint: "On-platform, after commission" },
        { key: "leads", label: "Leads" },
        { key: "conversions", label: "Conversions" },
        { key: "balance", label: "Wallet balance", money: true },
      ]}
    />
  );
}
