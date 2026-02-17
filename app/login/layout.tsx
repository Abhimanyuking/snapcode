import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - SnapCode",
  description: "Sign in to your SnapCode account",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
