export interface RulebookData {
  title: string;
  subtitle?: string;
  baseGame: string;
  theme?: string;
  description?: string;
  playerCount?: string;
  playTime?: string;
  age?: string;
  sections: RulebookSection[];
  customRules?: string[];
  /** Base64 data URI of the board art image */
  boardArtBase64?: string;
  /** Base64 data URI of the card art image */
  cardArtBase64?: string;
  /** Full AI-generated rules text (markdown) — used to build richer sections */
  rulesText?: string;
}

export interface RulebookSection {
  heading: string;
  body: string;
}

export type TemplateStyle = "fantasy" | "modern";
