import type { Metadata } from "next";
import InsurancePlans from "@/views/InsurancePlans";

export const metadata: Metadata = {
  title: "Health insurance plans | Labeasy",
  description:
    "Browse and buy health insurance plans from partner insurers on Labeasy.",
  alternates: { canonical: "/insurance" },
};

export default function InsurancePage() {
  return <InsurancePlans />;
}
