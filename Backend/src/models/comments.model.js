import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    user_id: { type: String, required: true },
    username: { type: String, default: "unknown" },
    media_pk: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
