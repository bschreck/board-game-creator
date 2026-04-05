import { NextRequest, NextResponse } from "next/server";

type TextFieldType = "title" | "description" | "rule" | "card-text" | "rules-booklet";

type PromptCtx = { baseGame: string; theme: string; gameName: string; rules: string[]; photoContext: string };

const PROMPTS: Record<TextFieldType, (ctx: PromptCtx) => string> = {
  title: ({ baseGame, theme, photoContext }) =>
    `Generate a creative, catchy, memorable board game title. The game is based on ${baseGame} mechanics but the title should NOT reference ${baseGame} at all.

Come up with a theme that is COMPLETELY UNRELATED to the original game. Think pop culture mashups, absurd scenarios, niche subcultures. Examples of great custom game themes:
- "Schitt's Creek: The Property Game" (Monopoly + TV show)
- "The Office: Threat Level Midnight" (Clue + The Office)
- "Taco Bell Menu Wars" (Risk + fast food)
- "Real Housewives: Backstab Edition" (Coup + reality TV)
- "Dog Park Diplomacy" (Codenames + dogs)
- "Taylor Swift Eras Tour: The Card Game" (UNO + Taylor Swift)

${theme ? `Current theme direction: "${theme}" - make the title match this theme.` : "Come up with something unexpected and fun."}
${photoContext ? `${photoContext} Incorporate references to visual elements from the photos if possible. NEVER mention filenames, file extensions, or that photos were uploaded.` : ""}

Respond with ONLY the title, no quotes, no explanation. Keep it under 8 words.`,
  description: ({ baseGame, theme, gameName, photoContext }) =>
    `Write a short, exciting 2-3 sentence theme description for a custom board game${gameName ? ` called "${gameName}"` : ""} that uses ${baseGame} mechanics.

The theme should be TOTALLY UNRELATED to the original ${baseGame} game. Think pop culture, movies, TV shows, memes, hobbies, absurd scenarios. Examples:
- A Monopoly game themed around "The Great British Bake Off" where you buy bakeries
- An UNO game themed around "Jurassic Park" where cards are dinosaurs
- A Codenames game themed around "RuPaul's Drag Race" with drag queen code names

${theme ? `Build on this theme direction: "${theme}"` : "Come up with something unexpected, funny, and specific."}
${photoContext ? `${photoContext} Reference what's depicted in the photos to make it personal. NEVER mention filenames, file extensions, or that photos were uploaded.` : ""}

Describe the vibe, setting, and what makes this version special. Make it sound like exciting back-of-box copy. Respond with ONLY the description, 2-3 sentences.`,
  rule: ({ baseGame, theme, rules }) =>
    `You are a creative board game designer. Generate ONE fun, surprising rule mutation for ${baseGame} with theme "${theme || "custom"}".
${rules?.length ? `\nDo NOT suggest these rules (already used): ${rules.join("; ")}` : ""}
Respond with ONLY the rule text, nothing else. No quotes, no prefix.`,
  "card-text": ({ baseGame, theme }) =>
    `Generate a fun, thematic card text or flavor text for a custom ${baseGame} game card with the theme "${theme || "party"}". This should be 1-2 sentences that could appear on a game card. Respond with ONLY the text.`,
  "rules-booklet": ({ baseGame, theme, gameName, rules, photoContext }) =>
    `Write a concise rules summary for a custom board game called "${gameName || "Custom Game"}" based on ${baseGame} with theme "${theme || "custom"}".
${rules?.length ? `Custom rule modifications:\n${rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}` : ""}
${photoContext ? `${photoContext} Reference the visual elements from the photos in the flavor text where appropriate. NEVER mention filenames, file extensions, or that photos were uploaded.` : ""}
Write 3-5 short paragraphs covering: game objective, setup, turn structure, winning conditions, and any custom rules. Keep it engaging and clear. Respond with ONLY the rules text.`,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { field, baseGame, theme, gameName, rules, photoContext } = body as {
    field: TextFieldType;
    baseGame: string;
    theme?: string;
    gameName?: string;
    rules?: string[];
    photoContext?: string;
  };

  if (!field || !baseGame) {
    return NextResponse.json({ error: "field and baseGame are required" }, { status: 400 });
  }

  const promptFn = PROMPTS[field];
  if (!promptFn) {
    return NextResponse.json({ error: "Invalid field type" }, { status: 400 });
  }

  try {
    const { cerebrasGenerate } = await import("@/lib/cerebras");
    const prompt = promptFn({ baseGame, theme: theme || "", gameName: gameName || "", rules: rules || [], photoContext: photoContext || "" });
    const text = await cerebrasGenerate(prompt);
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Text generation failed:", e);
    const message = e instanceof Error && e.message.includes("API_KEY")
      ? "AI generation is not configured"
      : "Failed to generate text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
