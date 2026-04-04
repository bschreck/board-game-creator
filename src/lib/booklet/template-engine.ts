import { RulebookData, TemplateStyle } from "./types";
import { renderFantasyTemplate } from "./templates/fantasy";
import { renderModernTemplate } from "./templates/modern";

const templateRenderers: Record<TemplateStyle, (data: RulebookData) => string> = {
  fantasy: renderFantasyTemplate,
  modern: renderModernTemplate,
};

export function renderTemplate(data: RulebookData, style: TemplateStyle = "modern"): string {
  const renderer = templateRenderers[style];
  if (!renderer) {
    throw new Error(`Unknown template style: ${style}`);
  }
  return renderer(data);
}

/**
 * Maps a game record from the database into the RulebookData format
 * expected by the template engine.
 */
export function gameToRulebookData(game: {
  name: string;
  baseGame: string;
  theme?: string | null;
  rules?: string;
  customRules?: string;
}): RulebookData {
  const customRules = parseJsonArray(game.customRules) || parseJsonArray(game.rules) || [];

  return {
    title: game.name,
    subtitle: `A custom ${game.baseGame} experience`,
    baseGame: game.baseGame,
    theme: game.theme || undefined,
    playerCount: "2-6",
    playTime: "30-60 min",
    age: "10",
    sections: [
      {
        heading: "Overview",
        body: `Welcome to ${game.name}! This is a custom version of ${game.baseGame}${game.theme ? `, themed around ${game.theme}` : ""}. The core gameplay follows the classic ${game.baseGame} rules with exciting custom twists.`,
      },
      {
        heading: "Components",
        body: [
          "- Game board",
          "- Playing cards",
          "- Rule booklet (you're reading it!)",
          "- Game tokens and pieces",
        ].join("\n"),
      },
      {
        heading: "Setup",
        body: `Set up the game according to the standard ${game.baseGame} rules. Place the board in the center of the table, shuffle all cards, and distribute starting pieces to each player. Make sure all players have read through the custom rules below before starting.`,
      },
      {
        heading: "How to Play",
        body: `On your turn, follow the standard ${game.baseGame} turn structure. Players take turns clockwise. Remember to apply any custom rules that modify the base gameplay. When in doubt, the custom rules take precedence over the base game rules.`,
      },
      {
        heading: "Winning",
        body: `The winner is determined according to standard ${game.baseGame} victory conditions, with any modifications from the custom rules applied.`,
      },
    ],
    customRules,
  };
}

function parseJsonArray(val?: string | null): string[] | null {
  if (!val) return null;
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not valid JSON
  }
  return null;
}
