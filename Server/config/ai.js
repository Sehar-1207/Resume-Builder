import OpenAI from "openai";

const ai = new OpenAI({
    apiKey: process.env.GEMINIE_API_KEY,
    baseURL: process.env.GEMINIE_BASE_URL,
});

export default ai;