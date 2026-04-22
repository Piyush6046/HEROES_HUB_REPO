import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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",
});

export const getAICaddyAdvice = async (scores, rank) => {
  const prompt = `You are the HeroesHub AI Caddy. A golfer with a rank of ${rank} has logged these recent Stableford scores: ${scores.join(", ")}. 
  Provide a short, punchy advice (max 60 words) on how to improve their game, and suggest 5 'lucky numbers' (between 1-36) for the next draw based on their form. 
  Format: JSON { "advice": "...", "luckyNumbers": [x,y,z,a,b] }`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.warn("GROQ Key Expired or Invalid. Using simulated AI response.");
    return {
      advice: "Your consistency is improving! To hit Ace rank, focus on your bunker play. Practice 3-foot putts for 15 minutes before your next round.",
      luckyNumbers: [4, 12, 19, 25, 33]
    };
  }
};

export const getCharityMatch = async (interests) => {
  const prompt = `Based on these interests: "${interests}", find the perfect charity alignment. 
  Format: JSON { "charityName": "...", "reason": "..." }`;
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    return { 
      charityName: "Ocean Clean Collective", 
      reason: "Aligned with your focus on environmental sustainability and marine protection." 
    };
  }
};
