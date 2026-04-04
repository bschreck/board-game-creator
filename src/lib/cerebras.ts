import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getCerebrasClient(): OpenAI {
  if (!_client) {
    const key = process.env.CEREBRAS_API_KEY;
    if (!key) throw new Error("CEREBRAS_API_KEY is required");
    _client = new OpenAI({
      baseURL: "https://api.cerebras.ai/v1",
      apiKey: key,
    });
  }
  return _client;
}

// llama3.1-8b for fast simple generation, zai-glm-4.7 for complex reasoning
const FAST_MODEL = "llama3.1-8b";
const REASONING_MODEL = "zai-glm-4.7";

export async function cerebrasGenerate(prompt: string, useReasoning = false): Promise<string> {
  const client = getCerebrasClient();
  const model = useReasoning ? REASONING_MODEL : FAST_MODEL;
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 2048,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}
