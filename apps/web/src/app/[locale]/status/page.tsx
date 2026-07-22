import type { Metadata } from "next";
import { StatusScreen } from "@/components/status/status-screen";

// The status screen must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function StatusPage() {
  return <StatusScreen />;
}
