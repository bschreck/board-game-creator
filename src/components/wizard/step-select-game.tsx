"use client";

import { motion } from "framer-motion";
import { BASE_GAMES, BaseGameId } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function StepSelectGame() {
  const { baseGame, setBaseGame } = useGameStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Base Game</h2>
        <p className="text-gray-500 mt-1">
          Pick a classic board game as your starting point. We&apos;ll help you make it uniquely yours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BASE_GAMES.map((game, i) => {
          const selected = baseGame === game.id;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 h-full ${
                  selected
                    ? "border-2 border-violet-500 shadow-lg shadow-violet-500/10 bg-violet-50/50"
                    : "hover:border-violet-200 hover:shadow-md"
                }`}
                onClick={() => setBaseGame(game.id as BaseGameId)}
              >
                <CardContent className="pt-5 pb-5 relative">
                  {selected && (
                    <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-violet-600 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{game.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{game.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {game.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {game.description}
                      </p>
                      <div className="flex gap-3 text-xs text-gray-400 mt-2">
                        <span>{game.playerCount} players</span>
                        <span>{game.duration}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
