import type { Metadata } from "next";
import { AuthPageClient } from "./auth-page-client";

export const metadata: Metadata = {
  title: "Auth - アカウント認証",
  description: "Firebase認証のテスト画面",
};

export default function AuthPage() {
  return <AuthPageClient />;
}
