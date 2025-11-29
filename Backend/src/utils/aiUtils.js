import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.config.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeSentiment = async (comments) => {
    if (!comments || comments.length === 0) {
        return {
            summary: "No comments to analyze.",
            sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
            keyThemes: [],
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Limit comments to avoid token limits and reduce cost/latency
        const commentsText = comments.slice(0, 50).join("\n");

        const prompt = `
      Analyze the sentiment of the following comments:
      "${commentsText}"

      Provide a JSON response with the following structure:
      {
        "summary": "A brief summary of the overall sentiment (max 2 sentences).",
        "sentimentDistribution": {
          "positive": 0, // Percentage as a number (0-100)
          "neutral": 0,  // Percentage as a number (0-100)
          "negative": 0  // Percentage as a number (0-100)
        },
        "keyThemes": ["Theme 1", "Theme 2", "Theme 3"] // Array of strings
      }
      Return ONLY the JSON. Do not include markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up potential markdown formatting
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("Sentiment Analysis Error:", error);
        throw new Error("Failed to analyze sentiment.");
    }
};
