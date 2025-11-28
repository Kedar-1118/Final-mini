import { google } from "googleapis";
import { createYoutubeOAuthClient } from "../utils/youtubeAuth.js";
import { LinkedAccount } from "../models/linkedAccount.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { config } from "../config/env.config.js";

const ANALYTICS_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];

export const startYoutubeOAuth = (req, res) => {
  const oauth2Client = createYoutubeOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ANALYTICS_SCOPES,
    state: req.user._id.toString(),
    prompt: "consent",
  });
  res.json({ url });
};

export const handleYoutubeOAuthCallback = async (req, res) => {
  const { code, state: user_id } = req.query;
  if (!code || !user_id) return res.status(400).send("Missing code or state.");

  try {
    const oauth2Client = createYoutubeOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const { data } = await youtube.channels.list({
      part: "id,snippet",
      mine: true,
    });

    const channel = data.items?.[0];
    if (!channel) return res.status(500).send("Channel info not found.");

    const updateData = {
      user_id,
      platform: "youtube",
      platform_user_id: channel.id,
      username: channel.snippet.title,
      access_token: encrypt(tokens.access_token),
      expires_at: new Date(tokens.expiry_date),
    };

    if (tokens.refresh_token) {
      updateData.refresh_token = encrypt(tokens.refresh_token);
    }

    await LinkedAccount.findOneAndUpdate(
      { user_id, platform: "youtube" },
      updateData,
      { upsert: true, new: true }
    );

    res.redirect(`${config.frontendUrl}/home?youtube=connected`);
  } catch (error) {
    console.error("YouTube OAuth Callback Error:", error.message);
    res.redirect(`${config.frontendUrl}/home?youtube=error`);
  }
};

const getValidClient = async (user_id) => {
  const account = await LinkedAccount.findOne({
    user_id,
    platform: "youtube",
  });
  if (!account) throw new Error("YouTube not linked or inactive.");

  let accessToken = decrypt(account.access_token);
  const refreshToken = decrypt(account.refresh_token);

  if (account.expires_at && account.expires_at.getTime() < Date.now() + 60000) {
    if (!refreshToken) {
      throw new Error("Session expired. Please reconnect your YouTube account.");
    }
    const oauth2Client = createYoutubeOAuthClient({
      access_token: accessToken,
    });
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    await LinkedAccount.updateOne(
      { _id: account._id },
      {
        access_token: encrypt(credentials.access_token),
        expires_at: new Date(credentials.expiry_date),
      }
    );
    accessToken = credentials.access_token;
  }

  const client = createYoutubeOAuthClient({ access_token: accessToken });
  return { client, channelId: account.platform_user_id };
};

export const getYoutubeAnalytics = async (req, res) => {
  try {
    const { client } = await getValidClient(req.user._id);
    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: client,
    });

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data } = await youtubeAnalytics.reports.query({
      ids: "channel==MINE",
      startDate,
      endDate,
      metrics:
        "views,likes,comments,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
    });

    // Return raw Google API response - frontend will handle transformation
    res.json(data);
  } catch (error) {
    console.error("YouTube Analytics Error:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};

export const getYoutubeComments = async (req, res) => {
  try {
    const { client, channelId } = await getValidClient(req.user._id);
    const youtube = google.youtube({ version: "v3", auth: client });

    const { data } = await youtube.commentThreads.list({
      part: "snippet",
      allThreadsRelatedToChannelId: channelId,
      maxResults: 25,
      order: "time",
    });

    res.json(data);
  } catch (error) {
    console.error("YouTube Comments Error:", error.message);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};

export const getYoutubeVideos = async (req, res) => {
  try {
    const { client } = await getValidClient(req.user._id);
    const youtube = google.youtube({ version: "v3", auth: client });

    // Get the uploads playlist ID for the user's channel
    const channelResponse = await youtube.channels.list({
      part: "contentDetails",
      mine: true,
    });

    const uploadsPlaylistId =
      channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
    if (!uploadsPlaylistId) {
      return res.status(404).json({ error: "Could not find uploads playlist." });
    }

    // Get videos from the uploads playlist
    const videosResponse = await youtube.playlistItems.list({
      part: "snippet,contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: 12,
    });

    res.json(videosResponse.data);
  } catch (error) {
    console.error("YouTube Videos Error:", error.message);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
};

export const updateYoutubeVideo = async (req, res) => {
  try {
    const { client } = await getValidClient(req.user._id);
    const videoId = req.params.id;
    const { title, description, tags, categoryId, privacyStatus } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required." });
    }

    const youtube = google.youtube({ version: "v3", auth: client });

    const response = await youtube.videos.update({
      part: "snippet,status",
      requestBody: {
        id: videoId,
        snippet: {
          title: title,
          description: description,
          tags: tags || [],
          categoryId: categoryId || "22",
        },
        status: {
          privacyStatus: privacyStatus || "private",
        },
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("YouTube Video Update Error:", error.message);
    res.status(500).json({ error: "Failed to update video." });
  }
};

export const uploadYoutubeVideo = async (req, res) => {
  try {
    const { client } = await getValidClient(req.user._id);
    const { title, description, tags, categoryId, privacyStatus } = req.body;
    const videoFilePath = req.file?.path;

    if (!videoFilePath) {
      return res.status(400).json({ error: "No video file uploaded." });
    }

    const youtube = google.youtube({ version: "v3", auth: client });
    const fs = require("fs");

    const response = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: tags ? tags.split(",") : [],
          categoryId: categoryId || "22",
        },
        status: {
          privacyStatus: privacyStatus || "private",
        },
      },
      media: {
        body: fs.createReadStream(videoFilePath),
      },
    });

    // Clean up uploaded file
    fs.unlinkSync(videoFilePath);

    res.json(response.data);
  } catch (error) {
    console.error("YouTube Video Upload Error:", error.message);
    // Clean up file on error
    if (req.file?.path) {
      const fs = require("fs");
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to upload video." });
  }
};

export const getChannelDetails = async (req, res) => {
  try {
    const { client } = await getValidClient(req.user._id);
    const youtube = google.youtube({ version: "v3", auth: client });

    const { data } = await youtube.channels.list({
      part: "snippet,brandingSettings,statistics",
      mine: true,
    });

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "Channel not found." });
    }

    res.json(data.items[0]);
  } catch (error) {
    console.error("YouTube Channel Details Error:", error.message);
    res.status(500).json({ error: "Failed to fetch channel details." });
  }
};

