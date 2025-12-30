
import { GoogleGenAI } from "@google/genai";

const API_KEY = (typeof process !== 'undefined' && (process.env.API_KEY || process.env.GEMINI_API_KEY)) || '';

export const getAIInsight = async (questions: string[]) => {
  if (!API_KEY || API_KEY.length < 10) return null;
  
  const combinedQuestions = questions.filter(Boolean).join(" | ");
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class academic mentor. Provide a single, concise (max 2 sentences), deep, and highly motivating scholar tip that synthesizes these three themes: "${combinedQuestions}". Focus on academic excellence, discipline, and vision.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};
