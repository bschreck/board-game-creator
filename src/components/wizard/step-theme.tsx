"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { generateText } from "@/lib/ai-helpers";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIGenerateButton } from "@/components/ui/ai-generate-button";
import { Palette, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";

const THEME_SUGGESTIONS = [
  "Our Family Vacation 2026",
  "Zombie Apocalypse Office Edition",
  "Backyard BBQ Championship",
  "College Reunion: The Reckoning",
  "Intergalactic Pizza Party",
  "Haunted Holiday House",
  "Around the World in 80 Snacks",
  "The Great Roommate Wars",
];

export function StepTheme() {
  const { gameName, theme, setGameName, setTheme, baseGame, acceptedRules } = useGameStore();
  const [generating, setGenerating] = useState(false);

  const handleGenerateBoth = async () => {
    setGenerating(true);
    try {
      const [nameResult, themeResult] = await Promise.all([
        generateText({
          field: "title",
          baseGame: baseGame || "board game",
          theme: theme || undefined,
          rules: acceptedRules,
        }),
        generateText({
          field: "description",
          baseGame: baseGame || "board game",
          gameName: gameName || undefined,
          rules: acceptedRules,
        }),
      ]);
      if (nameResult) setGameName(nameResult);
      if (themeResult) setTheme(themeResult);
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Name & Theme</h2>
        <p className="text-gray-500 mt-1">
          Give your game a name and theme. This drives the AI-generated art, copy, and overall vibe.
        </p>
      </div>

      {/* Big generate button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGenerateBoth}
        disabled={generating}
        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60"
      >
        <Sparkles className={`h-5 w-5 ${generating ? "animate-spin" : ""}`} />
        {generating ? "Generating..." : "✨ Generate Name & Theme with AI"}
      </motion.button>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Game Name
            </label>
            <AIGenerateButton
              label="AI Generate"
              onGenerate={() =>
                generateText({
                  field: "title",
                  baseGame: baseGame || "board game",
                  theme,
                  rules: acceptedRules,
                })
              }
              onResult={(text) => setGameName(text)}
            />
          </div>
          <Input
            placeholder={`e.g., "${baseGame === "monopoly" ? "Monopoly: Beach House Edition" : "The Ultimate Game Night"}`}
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="text-lg"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Theme Description
            </label>
            <AIGenerateButton
              label="AI Generate"
              onGenerate={() =>
                generateText({
                  field: "description",
                  baseGame: baseGame || "board game",
                  theme,
                  gameName,
                  rules: acceptedRules,
                })
              }
              onResult={(text) => setTheme(text)}
            />
          </div>
          <Textarea
            placeholder="Describe the theme, vibe, and any specific elements you want. The more detail, the better the AI can personalize your game..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Theme suggestions */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Need inspiration? Try one of these:
        </h3>
        <div className="flex flex-wrap gap-2">
          {THEME_SUGGESTIONS.map((suggestion) => (
            <motion.button
              key={suggestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setTheme(suggestion);
                if (!gameName) {
                  setGameName(suggestion);
                }
              }}
              className="group"
            >
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all py-1.5 px-3"
              >
                {suggestion}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview card */}
      {(gameName || theme) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {gameName || "Your Game Name"}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {theme || "Your theme will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
