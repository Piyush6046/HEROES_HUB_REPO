const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  try {
    const models = await genAI.listModels();
    console.log("Supported Models:");
    models.models.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`);
    });
  } catch (err) {
    console.error("Listing failed:", err.message);
  }
}

list();
