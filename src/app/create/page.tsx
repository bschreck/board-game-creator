"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepSelectGame } from "@/components/wizard/step-select-game";
import { StepCustomizeRules } from "@/components/wizard/step-customize-rules";
import { StepPhotos } from "@/components/wizard/step-photos";
import { StepTheme } from "@/components/wizard/step-theme";
import { StepPreview } from "@/components/wizard/step-preview";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Dice5,
  Shuffle,
  Camera,
  Palette,
  Eye,
} from "lucide-react";

const STEPS = [
  { id: "game", label: "Select Game", icon: Dice5 },
  { id: "rules", label: "Customize Rules", icon: Shuffle },
  { id: "photos", label: "Upload Photos", icon: Camera },
  { id: "theme", label: "Name & Theme", icon: Palette },
  { id: "preview", label: "Preview & Package", icon: Eye },
];

export default function CreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { step, setStep, baseGame, gameName, tier, savePendingState, restorePendingState, clearPendingState } = useGameStore();
  const [saving, setSaving] = useState(false);
  const restoredRef = useRef(false);

  // Restore pending game state after auth redirect
  useEffect(() => {
    if (restoredRef.current) return;
    if (status === "loading") return;
    restoredRef.current = true;

    if (status === "authenticated") {
      const hadPending = restorePendingState();
      if (hadPending) {
        clearPendingState();
        // Auto-save the restored game to the database
        const store = useGameStore.getState();
        if (store.baseGame && store.gameName) {
          fetch("/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              baseGame: store.baseGame,
              name: store.gameName,
              theme: store.theme,
              rules: store.acceptedRules,
              photos: store.photos.map((p) => p.name),
              tier: store.tier,
              boardPreview: store.boardPreview,
            }),
          }).catch(() => {});
        }
      }
    }
  }, [status, restorePendingState, clearPendingState]);

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!baseGame;
      case 1:
        return true; // Rules are optional
      case 2:
        return true; // Photos are optional
      case 3:
        return !!gameName;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1 && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleCheckout = async () => {
    if (!session) {
      savePendingState();
      signIn(undefined, { callbackUrl: "/create" });
      return;
    }

    setSaving(true);
    try {
      const store = useGameStore.getState();
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseGame: store.baseGame,
          name: store.gameName,
          theme: store.theme,
          rules: store.acceptedRules,
          photos: store.photos.map((p) => p.name),
          tier: store.tier,
          boardPreview: store.boardPreview,
        }),
      });

      if (!res.ok) throw new Error("Failed to save game");
      const { gameId } = await res.json();
      router.push(`/checkout?gameId=${gameId}`);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-y-auto">
      <Navbar />

      <div className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    i === step
                      ? "text-violet-700"
                      : i < step
                      ? "text-violet-500 cursor-pointer hover:text-violet-700"
                      : "text-gray-400 cursor-default"
                  }`}
                  disabled={i > step}
                >
                  <div
                    className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      i === step
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                        : i < step
                        ? "bg-violet-100 text-violet-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              ))}
            </div>
            <Progress value={progress} />
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <StepSelectGame />}
              {step === 1 && <StepCustomizeRules />}
              {step === 2 && <StepPhotos />}
              {step === 3 && <StepTheme />}
              {step === 4 && <StepPreview />}
            </motion.div>
          </AnimatePresence>

          {/* Spacer so content doesn't hide behind sticky nav */}
          <div className="h-24" />
        </div>
      </div>

      {/* Sticky bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            Step {step + 1} of {STEPS.length}
          </div>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCheckout}
              disabled={saving || !canProceed()}
              className="gap-2"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Checkout — {tier ? `$${(tier === "basic" ? 29 : tier === "premium" ? 49 : 79)}` : ""}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
