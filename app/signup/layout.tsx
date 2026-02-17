import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - SnapCode",
  description: "Create your SnapCode account",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
