import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      plan: "free" | "pro" | "team";
      subscriptionStatus: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    plan: string;
    subscriptionStatus: string | null;
  }
}
