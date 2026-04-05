"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BASE_GAMES } from "@/lib/game-data";
import {
  Loader2,
  Package,
  Send,
} from "lucide-react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const gameId = searchParams.get("gameId");

  const [game, setGame] = useState<{
    id: string;
    name: string;
    baseGame: string;
    theme: string;
    tier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: `/checkout?gameId=${gameId}` });
    }
  }, [status, gameId]);

  useEffect(() => {
    if (!gameId || !session) return;
    fetch("/api/game")
      .then((r) => r.json())
      .then((data) => {
        const g = data.games?.find(
          (g: { id: string }) => g.id === gameId
        );
        if (g) setGame(g);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gameId, session]);

  const gameData = game ? BASE_GAMES.find((g) => g.id === game.baseGame) : null;

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/order/success?gameId=${gameId}`);
      } else {
        throw new Error(data.error || "Failed to submit game");
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Package className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Game not found</p>
        <Button onClick={() => router.push("/create")}>Create a Game</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Game</h1>
          <Button variant="ghost" onClick={() => router.push("/create")} className="text-violet-600 hover:text-violet-700">
            &larr; Edit Game
          </Button>
        </div>
        <p className="text-gray-500 mb-8">
          Review your game details and submit. We&apos;ll email you all game assets for review.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-violet-500" />
              Game Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Game Name</span>
              <span className="font-medium">{game.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Based On</span>
              <span className="font-medium">{gameData?.name || game.baseGame}</span>
            </div>
            {game.theme && (
              <div className="flex justify-between">
                <span className="text-gray-500">Theme</span>
                <span className="font-medium">{game.theme}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Tier</span>
              <span className="font-medium capitalize">{game.tier}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="bg-violet-50 rounded-lg p-4 text-sm text-violet-800">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="space-y-1 list-disc list-inside text-violet-700">
                <li>We&apos;ll generate a rules PDF and gather all game assets</li>
                <li>Everything gets emailed to our team for review</li>
                <li>We&apos;ll get back to you with next steps</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Game Design
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
