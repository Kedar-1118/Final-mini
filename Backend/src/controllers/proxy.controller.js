import axios from "axios";

export const getImage = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Image URL required" });

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const contentType = response.headers["content-type"] || "image/jpeg";
    res.set("Content-Type", contentType);

    res.send(Buffer.from(response.data, "binary"));
  } catch (error) {
    console.error("Image proxy error:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
};
