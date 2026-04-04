"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BASE_GAMES, GAME_CATEGORIES, BaseGameId } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, ChevronDown } from "lucide-react";

const INITIAL_SHOW = 8;
const LOAD_MORE_COUNT = 8;

export function StepSelectGame() {
  const { baseGame, setBaseGame } = useGameStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [showCount, setShowCount] = useState(INITIAL_SHOW);

  const filtered = useMemo(() => {
    let games = [...BASE_GAMES];
    if (activeCategory !== "All") {
      games = games.filter((g) => g.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      games = games.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }
    return games;
  }, [search, activeCategory]);

  const visible = filtered.slice(0, showCount);
  const hasMore = showCount < filtered.length;

  // Reset show count when filters change
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setShowCount(INITIAL_SHOW);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setShowCount(INITIAL_SHOW);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Base Game</h2>
        <p className="text-gray-500 mt-1">
          Pick a classic board game as your starting point. We&apos;ll help you make it uniquely yours.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search games..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {GAME_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Game grid */}
      {visible.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No games match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((game, i) => {
            const selected = baseGame === game.id;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
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
      )}

      {/* Show more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowCount((c) => c + LOAD_MORE_COUNT)}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show more ({filtered.length - showCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
