"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Loader2,
  Layers,
  Box,
  Grid3X3,
  BookOpen,
  Maximize2,
  X,
} from "lucide-react";

interface Asset {
  id: string;
  type: string;
  name: string;
  url: string;
  format: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  card: <Layers className="h-4 w-4" />,
  "card-back": <Layers className="h-4 w-4" />,
  "box-front": <Box className="h-4 w-4" />,
  "box-back": <Box className="h-4 w-4" />,
  board: <Grid3X3 className="h-4 w-4" />,
  manual: <BookOpen className="h-4 w-4" />,
  "rules-doc": <BookOpen className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  card: "Cards",
  "card-back": "Card Back",
  "box-front": "Box Front",
  "box-back": "Box Back",
  board: "Game Board",
  manual: "Manual",
  "rules-doc": "Rules",
};

export function AssetGallery({ gameId }: { gameId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      const url = filter
        ? `/api/game/assets?gameId=${gameId}&type=${filter}`
        : `/api/game/assets?gameId=${gameId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets);
      }
    } finally {
      setLoading(false);
    }
  }, [gameId, filter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleRegenerate = async (assetId: string) => {
    setRegenerating(assetId);
    try {
      const res = await fetch("/api/game/regenerate-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, gameId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssets((prev) =>
          prev.map((a) => (a.id === assetId ? { ...a, url: data.asset.url } : a))
        );
        if (selectedAsset?.id === assetId) {
          setSelectedAsset((prev) => prev ? { ...prev, url: data.asset.url } : null);
        }
      }
    } finally {
      setRegenerating(null);
    }
  };

  // Group assets by type
  const grouped = assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    const key = asset.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(asset);
    return acc;
  }, {});

  const types = Object.keys(grouped);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-400">
          No assets generated yet. Start generation to see your game come to life.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          All ({assets.length})
        </Button>
        {types.map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
            className="gap-1.5"
          >
            {TYPE_ICONS[type]}
            {TYPE_LABELS[type] || type} ({grouped[type].length})
          </Button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {(filter ? grouped[filter] || [] : assets)
            .filter((a) => a.type !== "rules-doc") // Rules doc is text, not image
            .map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                  <div
                    className="relative aspect-[3/4] bg-gray-100"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <Badge className="absolute top-2 left-2 text-[10px] bg-black/60 text-white border-0">
                      {TYPE_LABELS[asset.type] || asset.type}
                    </Badge>
                  </div>
                  <CardContent className="p-2.5">
                    <p className="text-xs font-medium text-gray-900 truncate">{asset.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400 uppercase">{asset.format}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-violet-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerate(asset.id);
                        }}
                        disabled={regenerating === asset.id}
                      >
                        {regenerating === asset.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Rules document (text) */}
      {grouped["rules-doc"]?.length > 0 && (!filter || filter === "rules-doc") && (
        <Card className="mt-4">
          <CardContent className="pt-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-violet-500" />
              Rules Document
            </h3>
            <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs font-sans">
                {(() => {
                  try {
                    const meta = JSON.parse(grouped["rules-doc"][0].metadata as unknown as string || "{}");
                    return meta.content || grouped["rules-doc"][0].url;
                  } catch {
                    return grouped["rules-doc"][0].url;
                  }
                })()}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name}
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedAsset.name}</p>
                    <p className="text-white/60 text-sm">{TYPE_LABELS[selectedAsset.type] || selectedAsset.type}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white/30 hover:bg-white/20"
                    onClick={() => handleRegenerate(selectedAsset.id)}
                    disabled={regenerating === selectedAsset.id}
                  >
                    {regenerating === selectedAsset.id ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
