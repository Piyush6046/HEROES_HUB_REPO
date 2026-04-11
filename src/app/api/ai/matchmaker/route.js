import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Force stable v1 API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY, { apiVersion: "v1" });

export async function POST(req) {
  let charities = [];
  try {
    const body = await req.json();
    const userPreference = body.userPreference;
    charities = body.charities || [];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI assistant for a Golf Charity Platform. 
      A user is looking for a charity to support based on this preference: "${userPreference}".
      
      Here is our list of charities:
      ${charities.map(c => `- ${c.name}: ${c.description} (ID: ${c.id})`).join("\n")}

      Based on the user's preference, return ONLY JSON code for the single most relevant charity:
      { "id": "uuid", "name": "name", "reason": "why we picked this" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
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
