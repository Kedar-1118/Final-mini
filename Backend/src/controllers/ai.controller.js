import { GoogleGenerativeAI } from "@google/generative-ai";

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
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const ideas = JSON.parse(text);

        res.json({ ideas });
    } catch (error) {
        console.error("AI Trending Error:", error);
        res.status(500).json({ error: "Failed to generate trending ideas." });
    }
};

export const getRecommendations = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate 12 recommended short-form content ideas for Indian audiences.
For each idea, provide:
1. "title" – a short, hook-style title.
2. "caption" – a 1–2 sentence social media caption, engaging and ready to post.
3. "concept" – a brief description of the video idea / visuals / format.
4. "hashtags" – an array of 4–7 relevant hashtags as strings (include the '#' symbol, like "#productivity").

Return STRICTLY a JSON array of objects with keys: "title", "caption", "concept", "hashtags".
No markdown, no code blocks, no extra text — only raw JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // In case Gemini still wraps it in ```json ... ```
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const ideas = JSON.parse(text);

    // Final shape matches your frontend expectation
    res.json({ ideas });
  } catch (error) {
    console.error("AI Recommendations Error:", error);
    res.status(500).json({ error: "Failed to generate recommendations." });
  }
};
