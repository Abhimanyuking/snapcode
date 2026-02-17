import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  plan: "free" | "pro" | "team";
  razorpayCustomerId: string | null;
  razorpaySubscriptionId: string | null;
  subscriptionStatus: "active" | "cancelled" | "expired" | "pending" | null;
  subscriptionCurrentPeriodEnd: Date | null;
  dailyGenerations: number;
  dailyGenerationsResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function getNextMidnight(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    emailVerified: { type: Date, default: null },
    image: { type: String, default: null },
    password: { type: String, default: null },
    plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
    razorpayCustomerId: { type: String, default: null },
    razorpaySubscriptionId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending", null],
      default: null,
    },
    subscriptionCurrentPeriodEnd: { type: Date, default: null },
    dailyGenerations: { type: Number, default: 0 },
    dailyGenerationsResetAt: { type: Date, default: getNextMidnight },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
