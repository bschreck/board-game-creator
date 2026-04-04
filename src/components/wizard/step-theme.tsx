"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { generateText } from "@/lib/ai-helpers";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AIGenerateButton } from "@/components/ui/ai-generate-button";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export function StepTheme() {
  const { gameName, theme, setGameName, setTheme, baseGame, acceptedRules, photos } = useGameStore();
  const [generating, setGenerating] = useState(false);

  const photoContext = photos.length > 0
    ? `The user has uploaded ${photos.length} photo(s) named: ${photos.map((p) => p.name).join(", ")}. Use the photo names as inspiration for personalizing the theme.`
    : "";

  const handleGenerateBoth = async () => {
    setGenerating(true);
    try {
      const [nameResult, themeResult] = await Promise.all([
        generateText({
          field: "title",
          baseGame: baseGame || "board game",
          theme: theme || undefined,
          rules: acceptedRules,
          photoContext: photoContext || undefined,
        }),
        generateText({
          field: "description",
          baseGame: baseGame || "board game",
          gameName: gameName || undefined,
          rules: acceptedRules,
          photoContext: photoContext || undefined,
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
          Give your game a name and theme. This drives the generated art, copy, and overall vibe.
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
        {generating ? "Generating..." : "✨ Generate Name & Theme"}
      </motion.button>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Game Name
            </label>
            <AIGenerateButton
              label="Generate"
              onGenerate={() =>
                generateText({
                  field: "title",
                  baseGame: baseGame || "board game",
                  theme,
                  rules: acceptedRules,
                  photoContext: photoContext || undefined,
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
              label="Generate"
              onGenerate={() =>
                generateText({
                  field: "description",
                  baseGame: baseGame || "board game",
                  theme,
                  gameName,
                  rules: acceptedRules,
                  photoContext: photoContext || undefined,
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
    </div>
  );
}
