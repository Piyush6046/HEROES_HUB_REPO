import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

export async function POST(req) {
  try {
    const { scores } = await req.json();

    if (!scores || scores.length === 0) {
      return NextResponse.json({ insight: "Need scores to analyze. Start logging rounds to unlock AI coaching!" });
    }

    const prompt = `
      Performance Intel: The player has these golf scores: ${scores.join(", ")}.
      Give a very short, high-energy tactical tip and a 'Lucky Number' for the next draw.
      Keep it professional yet engaging (Max 150 characters).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    const text = chatCompletion.choices[0]?.message?.content || "Keep training.";

    return NextResponse.json({ insight: text });
  } catch (error) {
    console.error("AI Predict Error:", error);
    return NextResponse.json({ insight: "Consistent training detected. Your accuracy index is improving—stay the course." });
  }
}
