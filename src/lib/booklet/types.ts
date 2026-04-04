export interface RulebookData {
  title: string;
  subtitle?: string;
  baseGame: string;
  theme?: string;
  playerCount?: string;
  playTime?: string;
  age?: string;
  sections: RulebookSection[];
  customRules?: string[];
}

export interface RulebookSection {
  heading: string;
  body: string;
}

export type TemplateStyle = "fantasy" | "modern";
