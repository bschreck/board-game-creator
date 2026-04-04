"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Lightbulb } from "lucide-react";

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
  const { gameName, theme, setGameName, setTheme, baseGame } = useGameStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Name & Theme</h2>
        <p className="text-gray-500 mt-1">
          Give your game a name and theme. This drives the AI-generated art, copy, and overall vibe.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Game Name
          </label>
          <Input
            placeholder={`e.g., "${baseGame === "monopoly" ? "Monopoly: Beach House Edition" : "The Ultimate Game Night"}`}
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="text-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Theme Description
          </label>
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
