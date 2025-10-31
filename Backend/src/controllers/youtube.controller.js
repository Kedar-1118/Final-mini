import { google } from "googleapis";
import { createYoutubeOAuthClient } from "../utils/youtubeAuth.js";
import { LinkedAccount } from "../models/linkedAccount.js";
import { encrypt, decrypt } from "../utils/crypto.js";

const ANALYTICS_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export const startYoutubeOAuth = (req, res) => {
  const oauth2Client = createYoutubeOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ANALYTICS_SCOPES,
  });
  res.redirect(url);
};

export const handleYoutubeOAuthCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code or state.");

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

    await LinkedAccount.findOneAndUpdate(
      { platform: "youtube" },
      {
        platform_user_id: channel.id,
        username: channel.snippet.title,
        access_token: encrypt(tokens.access_token),
        refresh_token: encrypt(tokens.refresh_token),
        expires_at: new Date(tokens.expiry_date),
      },
      { upsert: true, new: true }
    );

    res.redirect("http://localhost:5173/youtube?status=success");
  } catch (error) {
    console.error("YouTube OAuth Callback Error:", error.message);
    res.redirect("http://localhost:5173/youtube?status=failure");
  }
};

const getValidClient = async (user_id) => {
  const account = await LinkedAccount.findOne({
    user_id,
    platform: "youtube",
    status: "active",
  });
  if (!account) throw new Error("YouTube not linked or inactive.");

  let accessToken = decrypt(account.access_token);
  const refreshToken = decrypt(account.refresh_token);

  if (account.expires_at && account.expires_at.getTime() < Date.now() + 60000) {
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
    const { client, channelId } = await getValidClient(req.user._id);

    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: client,
    });

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data } = await youtubeAnalytics.reports.query({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics:
        "views,likes,comments,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
    });

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
