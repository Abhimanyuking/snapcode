import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (typeof name !== "string" || name.length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      plan: "free",
    });

    return Response.json({ success: true, userId: user._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("[API /auth/signup]", error);
    return Response.json({ error: "Failed to create account" }, { status: 500 });
  }
}
