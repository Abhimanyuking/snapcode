import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import clientPromise from "@/lib/mongoClient";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: (credentials.email as string).toLowerCase() });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      if (token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select("plan subscriptionStatus").lean();
          if (dbUser) {
            token.plan = dbUser.plan;
            token.subscriptionStatus = dbUser.subscriptionStatus;
          }
        } catch {
          token.plan = token.plan || "free";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.plan = (token.plan as "free" | "pro" | "team") || "free";
        session.user.subscriptionStatus = (token.subscriptionStatus as string) || null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await connectDB();
        await User.findByIdAndUpdate(user.id, {
          $setOnInsert: { plan: "free", dailyGenerations: 0 },
        });
      }
    },
  },
});
