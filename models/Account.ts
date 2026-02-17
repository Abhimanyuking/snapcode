import mongoose, { Schema, type Model } from "mongoose";

const AccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
});

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Account: Model<any> =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
