import { NextRequest, NextResponse } from "next/server";
import { RULE_MUTATIONS } from "@/lib/game-data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { baseGame, excludeRules, useAI } = body;

  if (!baseGame) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  // AI-powered rule generation via Cerebras
  if (useAI) {
    try {
      const { cerebrasGenerate } = await import("@/lib/cerebras");
      const rule = await cerebrasGenerate(`You are a creative board game designer. Generate ONE fun, surprising rule mutation for ${baseGame}.

The rule should be a short, clear sentence that modifies the original game in a fun way. Be creative and funny.
${excludeRules?.length ? `\nDo NOT suggest these rules (already used): ${excludeRules.join("; ")}` : ""}

Respond with ONLY the rule text, nothing else. No quotes, no prefix.`);
      if (rule) {
        return NextResponse.json({ rule, source: "ai" });
      }
    } catch (e) {
      console.error("Cerebras rule generation failed, falling back to static:", e);
    }
  }

  // Fallback to static rules
  if (!RULE_MUTATIONS[baseGame]) {
    return NextResponse.json({ error: "No rules available for this game" }, { status: 400 });
  }

  const allRules = RULE_MUTATIONS[baseGame];
  const available = allRules.filter(
    (r) => !(excludeRules || []).includes(r)
  );

  if (available.length === 0) {
    return NextResponse.json({ rule: null, message: "No more rules available" });
  }

  const rule = available[Math.floor(Math.random() * available.length)];
  return NextResponse.json({ rule, source: "static" });
}
