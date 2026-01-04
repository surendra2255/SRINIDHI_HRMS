
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generates a professional job description for Srinidhi Associates.
export const generateJobDescription = async (title: string, department: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a professional and engaging job description for the position of "${title}" at Srinidhi Associates in the "${department}" department. Include Key Responsibilities, Required Skills, and Why Join Us sections.`,
    config: {
      temperature: 0.7,
      topP: 0.8,
    }
  });
  return response.text || "Failed to generate job description.";
};

// Summarizes raw performance review notes for Srinidhi Associates personnel.
export const summarizePerformanceReview = async (rawNotes: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the following raw performance review notes into a professional, concise summary for Srinidhi Associates' internal records: "${rawNotes}"`,
    config: {
      temperature: 0.4,
    }
  });
  return response.text || "Failed to summarize review.";
};
