import axios from "axios";

export const getImage =  async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Image URL required" });

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    res.set("Content-Type", "image/jpeg");
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch image" });
  }
}