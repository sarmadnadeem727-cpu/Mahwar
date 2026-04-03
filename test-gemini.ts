import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, are you active?");
    console.log("RESPONSE:", result.response.text());
  } catch (err: any) {
    console.error("ERROR:", JSON.stringify(err, null, 2));
  }
}

test();
