import mongoose from "mongoose";

const { Schema } = mongoose;

const LinkedAccountSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["instagram", "youtube"],
    },
    platform_user_id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },

    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
    },

    expires_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

LinkedAccountSchema.index({ user_id: 1, platform: 1 }, { unique: true });

export const LinkedAccount = mongoose.model(
  "LinkedAccount",
  LinkedAccountSchema
);
