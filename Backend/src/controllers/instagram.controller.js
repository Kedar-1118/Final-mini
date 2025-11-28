import { AsyncHandler } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import { config } from "../config/env.config.js";

export async function getProfileAndPosts(username) {
  try {
    const headers = {
      "x-rapidapi-key": config.rapidApi.key,
      "x-rapidapi-host": config.rapidApi.host,
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

async function fetchComments(username, posts = []) {
  if (!posts.length) return [];

  const allComments = [];

  // Limit to first 5 posts to avoid hitting API limits too hard
  const postsToFetch = posts.slice(0, 5);

  for (const post of postsToFetch) {
    if (!post.pk) continue;

    try {
      const response = await axios.get(
        "https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/comments",
        {
          params: { id: post.pk },
          headers: {
            "x-rapidapi-key": config.rapidApi.key,
            "x-rapidapi-host": config.rapidApi.hostCmnts,
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

      allComments.push(...cleanComments);
    } catch (err) {
      console.warn(`⚠️ Skipped post ${post.pk} due to API error`);
    }
  }

  return allComments;
}

export const getUserData = AsyncHandler(async (req, res) => {
  const { username } = req.params;

  // Fetch directly from RapidAPI
  const profileData = await getProfileAndPosts(username);

  return res.status(200).json(
    new ApiResponse(200, profileData, "User data fetched successfully from API")
  );
});

export const getUserComments = AsyncHandler(async (req, res) => {
  const { username } = req.params;

  // First get posts
  const profileData = await getProfileAndPosts(username);

  // Then get comments
  const comments = await fetchComments(username, profileData.posts);

  return res.status(200).json(
    new ApiResponse(200, comments, "Comments fetched successfully from API")
  );
});