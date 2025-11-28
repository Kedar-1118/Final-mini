import { GoogleGenerativeAI } from "@google/generative-ai";
import { AsyncHandler } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/ApiError.js";
import { getProfileAndPosts } from "./instagram.controller.js";
import { User } from "../models/user.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getTrendingIdeas = async (req, res) => {
  try {
    const { contentType } = req.body;

    if (!contentType) {
      return res.status(400).json({ error: "Content type is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate 12 trending content ideas for "${contentType}" specifically for the Indian audience. 
    For each idea, provide:
    1. A catchy Title.
    2. A brief Description (1-2 sentences).
    3. A "Why it's trending" reason (e.g., specific festival, news event, or viral trend in India).
    
    Return the response strictly as a JSON array of objects with keys: "title", "description", "reason". 
    Do not include any markdown formatting or code blocks, just the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up potential markdown formatting if Gemini adds it despite instructions
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const ideas = JSON.parse(text);

    res.json({ ideas });
  } catch (error) {
    console.error("AI Trending Error:", error);
    res.status(500).json({ error: "Failed to generate trending ideas." });
  }
};

export const getRecommendations = AsyncHandler(async (req, res) => {
  const username = req.user.instaUsername;

  if (!username) {
    throw new ApiError(400, "Instagram username not linked in profile");
  }

  // 1️⃣ Fetch live Instagram profile + posts via RapidAPI
  const profileData = await getProfileAndPosts(username);
  const posts = profileData.posts || [];

  if (!posts.length) {
    throw new ApiError(404, "No posts found for this user");
  }

  // 2️⃣ Simplify posts and limit size for the LLM
  const simplifiedPosts = posts.slice(0, 20).map((post) => ({
    url: post.url,
    caption: post.caption,
    likes: post.likes,
    comments: post.comments,
    image: post.image,
  }));

  const postsJson = JSON.stringify(simplifiedPosts).slice(0, 12000);

  // 3️⃣ Call Gemini with context of user’s past content + trends
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a social media strategist for Indian Instagram creators.

Here are some of my recent posts in JSON format:
${postsJson}

First, analyze these posts and:
- Identify which themes, hooks, tones, and formats seem to work best.
- Notice engagement patterns from likes and comments.

Then, ALSO consider broader, currently popular content patterns on Indian Instagram
(e.g., festivals, cricket, Bollywood, exams, finance, careers, lifestyle, etc.).

Using BOTH:
- my personal content history, and
- these wider Indian trends,

generate 12 NEW short-form content ideas that:
- Feel natural and consistent with my profile and audience.
- Leverage trending topics, sounds, or formats where appropriate.
- Are optimized for Indian audiences.

For each idea, provide:
1. "title" – a short, hook-style title.
2. "caption" – a 1–2 sentence Instagram caption, engaging and ready to post.
3. "concept" – a brief description of the reel/video idea or visuals.
4. "hashtags" – an array of 4–7 relevant hashtags as strings (with '#', e.g. "#productivity").

Return STRICTLY a JSON array of 12 objects with keys: "title", "caption", "concept", "hashtags".
No markdown, no code blocks, no explanation text — only raw JSON.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Clean any accidental markdown
  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const ideas = JSON.parse(text);

  // IMPORTANT: keep this shape so your frontend works: { ideas: [...] }
  return res.status(200).json({ ideas });
});
