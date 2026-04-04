"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { generateText } from "@/lib/ai-helpers";
import { getAvailableTiers } from "@/lib/pricing";
import { BASE_GAMES } from "@/lib/game-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Star,
  Sparkles,
  Loader2,
  Dice5,
  ScrollText,
  Camera,
  Palette,
  Wand2,
  Copy,
  BookOpen,
  RefreshCw,
  Layers,
  Box,
} from "lucide-react";

type ArtType = "board" | "card" | "box-cover";

interface GeneratedArt {
  image: string | null;
  error?: string;
}

async function generateArtImage(params: {
  imageType: ArtType;
  baseGame: string;
  theme: string;
  gameName: string;
  rules: string[];
  referenceStyle?: string;
}): Promise<GeneratedArt | null> {
  try {
    const res = await fetch("/api/game/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return { image: null, error: data.error || "Generation failed" };
    }
    return data;
  } catch {
    return { image: null, error: "Network error. Please try again." };
  }
}

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
  const [boardError, setBoardError] = useState("");

  // Art generation state
  const [artImages, setArtImages] = useState<Record<ArtType, GeneratedArt | null>>({
    board: null,
    card: null,
    "box-cover": null,
  });
  const [artLoading, setArtLoading] = useState<Record<ArtType, boolean>>({
    board: false,
    card: false,
    "box-cover": false,
  });
  const [copyStyleLoading, setCopyStyleLoading] = useState<Record<ArtType, boolean>>({
    board: false,
    card: false,
    "box-cover": false,
  });

  // Rules booklet
  const [rulesBooklet, setRulesBooklet] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);

  const selectedGame = BASE_GAMES.find((g) => g.id === baseGame);
  const availableTiers = getAvailableTiers(selectedGame?.category);
  const tierInfo = availableTiers.find(([key]) => key === tier)?.[1] ?? availableTiers[0][1];

  // Ensure current tier is valid for this game type
  const validTierKeys = availableTiers.map(([key]) => key);
  if (!validTierKeys.includes(tier)) {
    setTier(validTierKeys[validTierKeys.length - 1] as "basic" | "premium" | "deluxe");
  }

  const generatePreview = async () => {
    setGenerating(true);
    setBoardError("");
    try {
      const result = await generateArtImage({
        imageType: "board",
        baseGame: baseGame || "board game",
        theme,
        gameName,
        rules: acceptedRules,
      });
      if (result?.image) {
        setBoardPreview(result.image);
      } else {
        setBoardError(result?.error || "Failed to generate image. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateArt = useCallback(
    async (artType: ArtType) => {
      setArtLoading((prev) => ({ ...prev, [artType]: true }));
      try {
        const result = await generateArtImage({
          imageType: artType,
          baseGame: baseGame || "board game",
          theme,
          gameName,
          rules: acceptedRules,
        });
        if (result) {
          setArtImages((prev) => ({ ...prev, [artType]: result }));
        }
      } finally {
        setArtLoading((prev) => ({ ...prev, [artType]: false }));
      }
    },
    [baseGame, theme, gameName, acceptedRules]
  );

  // Copy style from one generated art to another
  const handleCopyStyle = useCallback(
    async (sourceType: ArtType, targetType: ArtType) => {
      const source = artImages[sourceType];
      if (!source?.image) return;

      setCopyStyleLoading((prev) => ({ ...prev, [targetType]: true }));
      try {
        // Describe the source style for the API to match
        const styleDesc = `Match the exact visual style, color palette, artistic technique, and aesthetic of the previously generated ${sourceType} art for this game. Maintain consistent branding and visual identity.`;
        const result = await generateArtImage({
          imageType: targetType,
          baseGame: baseGame || "board game",
          theme,
          gameName,
          rules: acceptedRules,
          referenceStyle: styleDesc,
        });
        if (result) {
          setArtImages((prev) => ({ ...prev, [targetType]: result }));
        }
      } finally {
        setCopyStyleLoading((prev) => ({ ...prev, [targetType]: false }));
      }
    },
    [artImages, baseGame, theme, gameName, acceptedRules]
  );

  const handleGenerateRulesBooklet = async () => {
    setRulesLoading(true);
    try {
      const text = await generateText({
        field: "rules-booklet",
        baseGame: baseGame || "board game",
        theme,
        gameName,
        rules: acceptedRules,
      });
      if (text) setRulesBooklet(text);
    } finally {
      setRulesLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Check which art types have been generated (for copy style)
  const generatedTypes = (Object.entries(artImages) as [ArtType, GeneratedArt | null][])
    .filter(([, art]) => art?.image)
    .map(([type]) => type);

  const artConfig: { key: ArtType; label: string; icon: typeof Palette }[] = [
    { key: "board", label: "Board Art", icon: Palette },
    { key: "card", label: "Card Art", icon: Layers },
    { key: "box-cover", label: "Box Art", icon: Box },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Preview & Package</h2>
        <p className="text-gray-500 mt-1">
          Generate AI art for your game, review details, and pick a package.
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
                <span className="font-medium">{gameName || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Theme</span>
                <span className="font-medium truncate max-w-[200px]">
                  {theme || "\u2014"}
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
            <div className="space-y-3">
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
              {boardError && (
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-700">{boardError}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={generating}
                className="text-violet-600"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                )}
                Regenerate
              </Button>
            </div>
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
                Uses AI to create a preview of your game board
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Art Generation */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-violet-500" />
            Game Art
          </h3>
          <p className="text-sm text-gray-500">
            Generate sample artwork for your game components.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {artConfig.map(({ key, label, icon: Icon }) => {
              const art = artImages[key];
              const isLoading = artLoading[key] || copyStyleLoading[key];

              return (
                <div key={key} className="space-y-3">
                  {art?.image ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                    >
                      <div className="p-2 bg-violet-50 flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-violet-600" />
                        <span className="text-xs font-medium text-violet-900">{label}</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.image}
                        alt={`${label} preview`}
                        className="w-full aspect-square object-cover"
                      />
                    </motion.div>
                  ) : art?.error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-xs font-medium text-red-900">{label}</span>
                      </div>
                      <p className="text-xs text-red-700">{art.error}</p>
                    </div>
                  ) : null}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-violet-600 border-violet-200 hover:bg-violet-50"
                    onClick={() => handleGenerateArt(key)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : art?.image ? (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {isLoading
                      ? "Generating..."
                      : art?.image
                        ? `Regenerate ${label}`
                        : `Generate ${label}`}
                  </Button>

                  {/* Copy Style buttons - show when other art types have been generated */}
                  {generatedTypes.length > 0 &&
                    generatedTypes.filter((t) => t !== key).map((sourceType) => (
                      <Button
                        key={sourceType}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-violet-500 hover:text-violet-700 hover:bg-violet-50"
                        onClick={() => handleCopyStyle(sourceType, key)}
                        disabled={copyStyleLoading[key]}
                      >
                        {copyStyleLoading[key] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        Copy style from{" "}
                        {artConfig.find((a) => a.key === sourceType)?.label}
                      </Button>
                    ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rules Booklet */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" />
              Rules Booklet
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1.5"
              onClick={handleGenerateRulesBooklet}
              disabled={rulesLoading}
            >
              {rulesLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              {rulesLoading ? "Generating..." : "AI Generate"}
            </Button>
          </div>
          {rulesBooklet ? (
            <div className="relative">
              <Textarea
                value={rulesBooklet}
                onChange={(e) => setRulesBooklet(e.target.value)}
                rows={10}
                className="text-sm"
              />
              <button
                onClick={() => copyToClipboard(rulesBooklet)}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Generate a complete rules booklet for your custom game with AI.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tier selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Choose Your Package</h3>
        {selectedGame?.category === "Cards" ? (
          <p className="text-sm text-gray-500 mb-3">
            Card games include two tiers optimized for card-based gameplay.
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-3">
            Custom game pieces available for select games.
          </p>
        )}
        <div className={`grid grid-cols-1 gap-4 ${availableTiers.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {availableTiers.map(([key, tierData], i) => {
            const isPopular =
              (availableTiers.length === 3 && i === 1) ||
              (availableTiers.length === 2 && i === 1);

            return (
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
                    {isPopular && (
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
                      {tierData.features.slice(0, 4).map((f, j) => (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
