import { NextRequest, NextResponse } from "next/server";
import { RULE_MUTATIONS } from "@/lib/game-data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { baseGame, excludeRules } = body;

  if (!baseGame || !RULE_MUTATIONS[baseGame]) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const allRules = RULE_MUTATIONS[baseGame];
  const available = allRules.filter(
    (r) => !(excludeRules || []).includes(r)
  );

  if (available.length === 0) {
    return NextResponse.json({ rule: null, message: "No more rules available" });
  }

  const rule = available[Math.floor(Math.random() * available.length)];
  return NextResponse.json({ rule });
}
