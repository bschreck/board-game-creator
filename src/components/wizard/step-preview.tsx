"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { PRICING } from "@/lib/stripe";
import { BASE_GAMES } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Sparkles,
  Loader2,
  Dice5,
  ScrollText,
  Camera,
  Palette,
} from "lucide-react";

export function StepPreview() {
  const {
    baseGame,
    gameName,
    theme,
    acceptedRules,
    photos,
    tier,
    setTier,
    boardPreview,
    setBoardPreview,
  } = useGameStore();
  const [generating, setGenerating] = useState(false);

  const selectedGame = BASE_GAMES.find((g) => g.id === baseGame);
  const tierInfo = PRICING[tier];

  const generatePreview = async () => {
    setGenerating(true);
    // Simulate AI generation (would call OpenAI API in production)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // Generate a gradient-based preview placeholder
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(0.5, "#4f46e5");
      gradient.addColorStop(1, "#2563eb");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // Board outline
      ctx.strokeStyle = "#ffffff40";
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, 680, 480);

      // Grid lines
      ctx.strokeStyle = "#ffffff20";
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(60 + i * 85, 60);
        ctx.lineTo(60 + i * 85, 540);
        ctx.stroke();
        if (i < 6) {
          ctx.beginPath();
          ctx.moveTo(60, 60 + i * 80);
          ctx.lineTo(740, 60 + i * 80);
          ctx.stroke();
        }
      }

      // Title
      ctx.fillStyle = "white";
      ctx.font = "bold 36px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(gameName || "Your Custom Game", 400, 320);

      ctx.font = "18px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#c4b5fd";
      ctx.fillText(theme || "Custom Theme", 400, 355);

      // Corner labels
      ctx.font = "bold 14px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#ffffff80";
      ctx.textAlign = "left";
      ctx.fillText("START", 75, 85);
      ctx.textAlign = "right";
      ctx.fillText("FINISH", 725, 530);
    }
    setBoardPreview(canvas.toDataURL("image/png"));
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Preview & Package</h2>
        <p className="text-gray-500 mt-1">
          Review your game, pick a package, and generate an AI preview of your board.
        </p>
      </div>

      {/* Game summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Dice5 className="h-4 w-4 text-violet-500" />
              Game Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base Game</span>
                <span className="font-medium">
                  {selectedGame?.icon} {selectedGame?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Game Name</span>
                <span className="font-medium">{gameName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Theme</span>
                <span className="font-medium truncate max-w-[200px]">
                  {theme || "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-violet-500" />
              Custom Rules ({acceptedRules.length})
            </h3>
            {acceptedRules.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {acceptedRules.slice(0, 4).map((rule, i) => (
                  <li key={i} className="flex gap-2 text-gray-600">
                    <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{rule}</span>
                  </li>
                ))}
                {acceptedRules.length > 4 && (
                  <li className="text-gray-400 text-xs">
                    +{acceptedRules.length - 4} more rules
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No custom rules added</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Photos summary */}
      {photos.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-violet-500" />
              Photos ({photos.length})
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo) => (
                <div
                  key={photo.url}
                  className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Board Preview */}
      <Card className="overflow-hidden">
        <CardContent className="pt-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-violet-500" />
            Board Preview
          </h3>
          {boardPreview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl overflow-hidden border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={boardPreview}
                alt="Board preview"
                className="w-full"
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-gray-50 border border-dashed border-gray-200">
              <Button
                onClick={generatePreview}
                disabled={generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Board Preview
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Creates a preview of your game board layout
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Choose Your Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(PRICING) as [string, (typeof PRICING)[keyof typeof PRICING]][]).map(
            ([key, tierData], i) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    tier === key
                      ? "border-2 border-violet-500 shadow-lg shadow-violet-500/10"
                      : "hover:border-violet-200"
                  }`}
                  onClick={() => setTier(key as "basic" | "premium" | "deluxe")}
                >
                  <CardContent className="pt-5 pb-5">
                    {i === 1 && (
                      <Badge className="mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    <div className="flex items-baseline justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{tierData.name}</h4>
                      <span className="text-2xl font-extrabold text-gray-900">
                        {tierData.display}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      {tierData.description}
                    </p>
                    <ul className="space-y-1">
                      {tierData.features.slice(0, 3).map((f, j) => (
                        <li
                          key={j}
                          className="text-xs text-gray-600 flex items-center gap-1.5"
                        >
                          <Check className="h-3 w-3 text-violet-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
