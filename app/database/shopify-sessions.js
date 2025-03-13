import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, unique: true },
    state: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    scope: { type: String, default: null },
    expires: { type: Date, default: null },
    accessToken: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.Mixed, default: null }, 
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    accountOwner: { type: Boolean, default: false },
    locale: { type: String, default: null },
    collaborator: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }, // Adds createdAt & updatedAt fields automatically
);

const SessionModel =
  mongoose.models.shopify_sessions || mongoose.model("shopify_sessions", sessionSchema);


export default SessionModel;
