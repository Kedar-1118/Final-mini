import { AsyncHandler } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { InstagramUser } from "../models/instagram.model.js";
import { Comment } from "../models/comments.model.js";
import axios from "axios";

async function getProfileAndPosts(username) {
  try {
    const headers = {
      "x-rapidapi-key": process.env["x-rapidapi-key"],
      "x-rapidapi-host": process.env["x-rapidapi-host"],
      "Content-Type": "application/json",
    };

    const [profile, posts] = await Promise.all([
      axios.post("https://instagram120.p.rapidapi.com/api/instagram/userInfo", { username }, { headers }),
      axios.post("https://instagram120.p.rapidapi.com/api/instagram/posts", { username }, { headers }),
    ]);

    const user = profile.data?.result?.[0]?.user || {};
    const edges = posts.data?.result?.edges || [];

    const postUrls = edges
      .filter(({ node }) => node.pk)
      .map(({ node }) => ({
        pk: node.pk,
        url: `https://www.instagram.com/p/${node.code}/`,
        caption: node.caption?.text || "",
        likes: node.like_count || 0,
        comments: node.comment_count || 0,
        image: node.image_versions2?.candidates?.[0]?.url || null,
      }));

    return {
      username,
      full_name: user.full_name || "",
      profile_pic: user.hd_profile_pic_url_info?.url || "",
      followers: user.follower_count || 0,
      following: user.following_count || 0,
      bio: user.biography || "",
      posts: postUrls,
    };
  } catch (error) {
    console.error("❌ Error fetching data:", error.response?.data || error.message);
    throw new ApiError(500, "Failed to fetch Instagram data");
  }
}

async function fetchAndStoreCommentsHelper(username, posts = []) {
  if (!posts.length) throw new ApiError(404, "No posts found for fetching comments");

  const allComments = [];

  for (const post of posts) {
    if (!post.pk) continue;

    try {
      const response = await axios.get(
        "https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/comments",
        {
          params: { id: post.pk },
          headers: {
            "x-rapidapi-key": process.env["x-rapidapi-key"],
            "x-rapidapi-host": process.env["x-rapidapi-host-cmnts"],
          },
        }
      );

      const comments = response.data?.comments || [];
      const cleanComments = comments.map((c) => ({
        text: c.text,
        user_id: c.user_id,
        username: c.user?.username || "unknown",
        media_pk: post.pk,
      }));

      if (cleanComments.length > 0) {
        await Comment.deleteMany({ media_pk: post.pk });
        await Comment.insertMany(cleanComments);
        allComments.push(...cleanComments);
      }
    } catch (err) {
      console.warn(`⚠️ Skipped post ${post.pk} due to API error`);
    }
  }

  return allComments;
}

export const addUsername = AsyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username?.trim()) throw new ApiError(400, "Username is required");

  // Prevent duplicates
  const existingUser = await InstagramUser.findOne({ username });
  if (existingUser)
    throw new ApiError(409, "Username already exists in database");

  // Fetch data from RapidAPI
  const profileData = await getProfileAndPosts(username);
  const comments = await fetchAndStoreCommentsHelper(username, profileData.posts);

  // Store data in DB
  const newUser = await InstagramUser.create({
    ...profileData,
    commentsCount: comments.length,
  });

  return res.status(201).json(
    new ApiResponse(201, {
      user: newUser,
      totalComments: comments.length,
    }, "Instagram data fetched and stored successfully")
  );
});

export const refreshUserData = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) throw new ApiError(400, "Username is required");

  const existingUser = await InstagramUser.findOne({ username });
  if (!existingUser) throw new ApiError(404, "User not found");

  // Re-fetch and overwrite
  const profileData = await getProfileAndPosts(username);
  const comments = await fetchAndStoreCommentsHelper(username, profileData.posts);

  existingUser.set({
    ...profileData,
    commentsCount: comments.length,
  });
  await existingUser.save();

  return res.status(200).json(
    new ApiResponse(200, {
      user: existingUser,
      totalComments: comments.length,
    }, "Instagram data refreshed successfully")
  );
});

export const getUserData = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await InstagramUser.findOne({ username });
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, user, "User data fetched successfully from DB")
  );
});

export const getUserComments = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  const igUser = await InstagramUser.findOne({ username });
  if (!igUser) throw new ApiError(404, "User not found");

  const mediaPks = igUser.posts.map((p) => p.pk);
  const comments = await Comment.find({ media_pk: { $in: mediaPks } });

  if (!comments.length) throw new ApiError(404, "No comments found in DB");

  return res.status(200).json(
    new ApiResponse(200, comments, "Comments fetched successfully from DB")
  );
});