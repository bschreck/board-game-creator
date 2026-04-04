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

const MODEL = "zai-glm-4.7";

export async function cerebrasGenerate(prompt: string): Promise<string> {
  const client = getCerebrasClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_completion_tokens: 4096,
  });
  return response.choices[0]?.message?.content?.trim() || "";
}
