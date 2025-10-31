import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  pk: { type: String, required: true },
  url: String,
  caption: String,
  likes: Number,
  comments: Number,
  image: String,
});


const instagramSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    full_name: String,
    profile_pic: String,
    followers: Number,
    following: Number,
    bio: String,
    posts: [postSchema],
  },
  { timestamps: true }
);

export const InstagramUser = mongoose.model("InstagramUser", instagramSchema);
