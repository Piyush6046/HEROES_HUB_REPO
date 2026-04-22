import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

export async function POST(req) {
  try {
    const { message, history, context } = await req.json();

    const systemPrompt = `You are a helpful, enthusiastic AI assistant for the HeroesHub platform — a premium golf charity subscription service. Help users navigate draws, charities, scores, and more.
    Be concise, friendly, and upbeat. Keep answers under 120 words unless the user asks for detail.
    Format your responses using Markdown (e.g., **bold**, bullet points).
    
    Here is the context about the current user:
    - User ID/Email: ${context?.userName || 'Anonymous'}
    - Total Rounds Logged: ${context?.totalScoresCount || 0}
    - Recent Scores: ${context?.recentScores?.join(', ') || 'None yet'}
    - Charity Selected: ${context?.charitySet ? 'Yes' : 'No'}
    
    Use this information contextually if the user asks about their own profile. Ignore it if they ask general questions.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...(history || []),
      { role: "user", content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant", // Currently active model
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "I'm sorry, I'm having trouble thinking right now.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    return NextResponse.json({
      reply: "I seem to be disconnected from my brain. Please try again later!",
    });
  }
}
