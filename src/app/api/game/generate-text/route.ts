import { NextRequest, NextResponse } from "next/server";

type TextFieldType = "title" | "description" | "rule" | "card-text" | "rules-booklet";

const PROMPTS: Record<TextFieldType, (ctx: { baseGame: string; theme: string; gameName: string; rules: string[] }) => string> = {
  title: ({ baseGame, theme }) =>
    `Generate a single creative, catchy board game title for a custom version of ${baseGame} with the theme "${theme || "fun party game"}". Respond with ONLY the title, no quotes, no explanation. Keep it under 8 words.`,
  description: ({ baseGame, theme, gameName }) =>
    `Write a short, exciting 1-2 sentence description for a custom board game called "${gameName || "Custom Game"}" based on ${baseGame} with the theme "${theme || "party fun"}". Make it sound like back-of-box marketing copy. Respond with ONLY the description.`,
  rule: ({ baseGame, theme, rules }) =>
    `You are a creative board game designer. Generate ONE fun, surprising rule mutation for ${baseGame} with theme "${theme || "custom"}".
${rules?.length ? `\nDo NOT suggest these rules (already used): ${rules.join("; ")}` : ""}
Respond with ONLY the rule text, nothing else. No quotes, no prefix.`,
  "card-text": ({ baseGame, theme }) =>
    `Generate a fun, thematic card text or flavor text for a custom ${baseGame} game card with the theme "${theme || "party"}". This should be 1-2 sentences that could appear on a game card. Respond with ONLY the text.`,
  "rules-booklet": ({ baseGame, theme, gameName, rules }) =>
    `Write a concise rules summary for a custom board game called "${gameName || "Custom Game"}" based on ${baseGame} with theme "${theme || "custom"}".
${rules?.length ? `Custom rule modifications:\n${rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}` : ""}
Write 3-5 short paragraphs covering: game objective, setup, turn structure, winning conditions, and any custom rules. Keep it engaging and clear. Respond with ONLY the rules text.`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { field, baseGame, theme, gameName, rules } = body as {
    field: TextFieldType;
    baseGame: string;
    theme?: string;
    gameName?: string;
    rules?: string[];
  };

  if (!field || !baseGame) {
    return NextResponse.json({ error: "field and baseGame are required" }, { status: 400 });
  }

  const promptFn = PROMPTS[field];
  if (!promptFn) {
    return NextResponse.json({ error: "Invalid field type" }, { status: 400 });
  }

  try {
    const { getGemini } = await import("@/lib/gemini");
    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = promptFn({ baseGame, theme: theme || "", gameName: gameName || "", rules: rules || [] });
    const response = await model.generateContent(prompt);
    const text = response.response.text()?.trim();
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Text generation failed:", e);
    const message = e instanceof Error && e.message.includes("API_KEY")
      ? "AI generation is not configured"
      : "Failed to generate text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
