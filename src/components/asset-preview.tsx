"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Box, Layers, ScrollText, RefreshCw } from "lucide-react";

interface PreviewData {
  cardPreview: string | null;
  boxPreview: string | null;
  rulesPreview: string;
}

interface AssetPreviewProps {
  gameName: string;
  baseGame: string;
  theme: string;
  rules: string[];
  tier: string;
}

export function AssetPreview({ gameName, baseGame, theme, rules, tier }: AssetPreviewProps) {
  const [previews, setPreviews] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePreviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/preview-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, baseGame, theme, rules, tier }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviews(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!previews) {
    return (
      <Card>
        <CardContent className="py-10 flex flex-col items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-100">
            <Sparkles className="h-8 w-8 text-violet-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">Preview Your Game</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              See AI-generated previews of your card designs, box art, and rules before ordering.
            </p>
          </div>
          <Button
            onClick={generatePreviews}
            disabled={loading}
            size="lg"
            className="mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Previews...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Previews
              </>
            )}
          </Button>
          {loading && (
            <p className="text-xs text-gray-400 animate-pulse">
              This may take 30-60 seconds...
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Asset Previews</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={generatePreviews}
          disabled={loading}
          className="text-violet-600 gap-1.5"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Regenerate All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Preview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="p-3 bg-violet-50 flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">Sample Card Design</span>
            </div>
            {previews.cardPreview ? (
              <div className="aspect-[3/4] bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews.cardPreview}
                  alt="Card preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-400">Card preview unavailable</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Box Art Preview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <div className="p-3 bg-violet-50 flex items-center gap-2">
              <Box className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">Box Cover Art</span>
            </div>
            {previews.boxPreview ? (
              <div className="aspect-[3/4] bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews.boxPreview}
                  alt="Box preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-gray-400">Box preview unavailable</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Rules Preview */}
      {previews.rulesPreview && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-5">
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <ScrollText className="h-4 w-4 text-violet-500" />
                Rules Preview
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">
                  {previews.rulesPreview}
                </pre>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Full rules document will be generated after ordering.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
