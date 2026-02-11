import type { Metadata } from "next";
import { DebugPageClient } from "./debug-page-client";

export const metadata: Metadata = {
  title: "Debug - Firebase Auth & API",
  description: "Firebase認証とAPIのデバッグページ",
};

export default function DebugPage() {
  return <DebugPageClient />;
}
