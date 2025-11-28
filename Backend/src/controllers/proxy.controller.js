import axios from "axios";

export const getImage = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Image URL required" });
  }

  try {
    // console.log(`[Proxy] Fetching image: ${url}`);

    // Add headers to properly fetch Instagram/social media images
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.instagram.com/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      timeout: 15000, // 15 second timeout
      maxRedirects: 5,
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    // console.log(`[Proxy] Successfully fetched image, content-type: ${contentType}`);

    // Set CORS and cache headers
    res.set({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });

    res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("[Proxy] Image fetch error:", {
      url,
      error: error?.message || error,
      response: error?.response?.status,
    });

    // Return a transparent 1x1 pixel as fallback
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    res.set("Content-Type", "image/png");
    res.status(200).send(transparentPixel);
  }
};
