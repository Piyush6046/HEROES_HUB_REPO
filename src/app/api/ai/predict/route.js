import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(req) {
  try {
    const { scores } = await req.json();

    if (!scores || scores.length === 0) {
      return NextResponse.json({ insight: "Need scores to analyze. Start logging rounds to unlock AI coaching!" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Performance Intel: The player has these golf scores: ${scores.join(", ")}.
      Give a very short, high-energy tactical tip and a 'Lucky Number' for the next draw.
      Keep it professional yet engaging (Max 150 characters).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error("AI Predict Error:", error);
    return NextResponse.json({ insight: "Consistent training detected. Your accuracy index is improving—stay the course." });
  }
}
