import type { Metadata } from "next";
import Home from "@/views/Home";

export const metadata: Metadata = {
  title: "Labeasy — Compare labs, book tests & understand your results with AI",
  description:
    "Compare diagnostic test prices across accredited labs, book online with home collection, and get AI-powered report summaries, health trends, doctor recommendations, and reminders — all in one secure place.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Home />;
}
