import type { Metadata } from "next";
import Home from "@/views/Home";

export const metadata: Metadata = {
  title: "Labeasy — Compare diagnostic labs & book tests at the best price",
  description:
    "Labeasy lets you compare diagnostic test prices across accredited labs, book online, and keep all your reports in one secure place. Affordable diagnostics for every city.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Home />;
}
