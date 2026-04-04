"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BASE_GAMES } from "@/lib/game-data";
import { GenerationProgress } from "@/components/generation-progress";
import { AssetGallery } from "@/components/asset-gallery";
import {
  Plus,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Loader2,
  ArrowRight,
  Dice5,
  Eye,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface GameWithOrder {
  id: string;
  name: string;
  baseGame: string;
  theme: string;
  tier: string;
  status: string;
  createdAt: string;
  order?: {
    id: string;
    status: string;
    paymentStatus: string;
    trackingNumber: string | null;
    amount: number;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive"; icon: typeof Clock }> = {
  draft: { label: "Draft", variant: "secondary", icon: Clock },
  checkout: { label: "Checkout", variant: "default", icon: Package },
  ordered: { label: "Generating", variant: "default", icon: Sparkles },
  generating: { label: "Generating Assets", variant: "default", icon: Sparkles },
  printing: { label: "Printing", variant: "default", icon: Package },
  processing: { label: "Being Made", variant: "default", icon: Package },
  shipped: { label: "Shipped", variant: "success", icon: Truck },
  delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<GameWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/dashboard" });
    }
  }, [authStatus]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/game")
      .then((r) => r.json())
      .then((data) => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Games
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage your custom board game creations
                </p>
              </div>
              <Link href="/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Game
                </Button>
              </Link>
            </div>

            {games.length === 0 ? (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Dice5 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No games yet
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first custom board game. Choose a classic,
                    customize the rules, add your photos, and we&apos;ll handle
                    the rest.
                  </p>
                  <Link href="/create">
                    <Button size="lg" className="gap-2">
                      Create Your First Game
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {games.map((game, i) => {
                  const baseGameInfo = BASE_GAMES.find(
                    (g) => g.id === game.baseGame
                  );
                  const status =
                    statusConfig[game.order?.status || game.status] ||
                    statusConfig.draft;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-2xl shrink-0">
                              {baseGameInfo?.icon || "🎲"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-gray-900 truncate">
                                  {game.name}
                                </h3>
                                <Badge variant={status.variant}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {baseGameInfo?.name} &bull; {game.theme || "No theme"} &bull;{" "}
                                {game.tier.charAt(0).toUpperCase() + game.tier.slice(1)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Created{" "}
                                {new Date(game.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="shrink-0 flex gap-2">
                              {game.status === "draft" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/checkout?gameId=${game.id}`
                                    )
                                  }
                                >
                                  Complete Order
                                </Button>
                              )}
                              {["ordered", "generating", "printing"].includes(game.status) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {expandedGame === game.id ? "Hide" : "View"} Progress
                                </Button>
                              )}
                              {game.order?.trackingNumber && (
                                <Button variant="outline" size="sm">
                                  <Truck className="h-4 w-4 mr-1" />
                                  Track
                                </Button>
                              )}
                            </div>
                          </div>
                          {/* Expandable generation progress & assets */}
                          {expandedGame === game.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-100 space-y-4"
                            >
                              <GenerationProgress gameId={game.id} />
                              <AssetGallery gameId={game.id} />
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
