import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

export async function POST(req) {
  let charities = [];
  try {
    const body = await req.json();
    const userPreference = body.userPreference;
    charities = body.charities || [];

    const prompt = `
      You are an AI assistant for a Golf Charity Platform. 
      A user is looking for a charity to support based on this preference: "${userPreference}".
      
      Here is our list of charities:
      ${charities.map(c => `- ${c.name}: ${c.description} (ID: ${c.id})`).join("\n")}

      Based on the user's preference, return ONLY JSON code for the single most relevant charity:
      { "id": "uuid", "name": "name", "reason": "why we picked this" }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const jsonMatch = chatCompletion.choices[0]?.message?.content?.match(/\{[\s\S]*\}/);
    const text = jsonMatch ? jsonMatch[0] : "{}";
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Matchmaker Error:", error);
    if (charities.length > 0) {
      return NextResponse.json({ 
        id: charities[0].id, 
        name: charities[0].name, 
        reason: "Matched with our top partner." 
      });
    }
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}
