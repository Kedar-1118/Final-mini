import { google } from "googleapis";

const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REDIRECT_URI } = process.env;

export const createYoutubeOAuthClient = (tokens = {}) => {
  const client = new google.auth.OAuth2(
    YT_CLIENT_ID,
    YT_CLIENT_SECRET,
    YT_REDIRECT_URI
  );

  if (tokens.access_token) {
    client.setCredentials(tokens);
  }
  return client;
};
