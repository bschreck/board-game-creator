"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { RULE_MUTATIONS } from "@/lib/game-data";
import { generateText } from "@/lib/ai-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Check, X, Sparkles, Trash2, Wand2, Loader2 } from "lucide-react";

export function StepCustomizeRules() {
  const { baseGame, theme, acceptedRules, rejectedRules, acceptRule, rejectRule, removeRule } =
    useGameStore();
  const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const allRules = baseGame ? RULE_MUTATIONS[baseGame] || [] : [];
  const availableRules = allRules.filter(
    (r) => !acceptedRules.includes(r) && !rejectedRules.includes(r)
  );

  const suggestRule = useCallback(() => {
    if (availableRules.length === 0) return;
    setShaking(true);
    setTimeout(() => {
      const random = availableRules[Math.floor(Math.random() * availableRules.length)];
      setCurrentSuggestion(random);
      setShaking(false);
    }, 600);
  }, [availableRules]);

  const suggestAIRule = useCallback(async () => {
    if (!baseGame) return;
    setAiLoading(true);
    try {
      const rule = await generateText({
        field: "rule",
        baseGame,
        theme,
        rules: [...acceptedRules, ...rejectedRules],
      });
      if (rule) {
        setCurrentSuggestion(rule);
      }
    } finally {
      setAiLoading(false);
    }
  }, [baseGame, theme, acceptedRules, rejectedRules]);

  const handleAccept = () => {
    if (currentSuggestion) {
      acceptRule(currentSuggestion);
      setCurrentSuggestion(null);
    }
  };

  const handleReject = () => {
    if (currentSuggestion) {
      rejectRule(currentSuggestion);
      setCurrentSuggestion(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Customize the Rules</h2>
        <p className="text-gray-500 mt-1">
          Shake things up with wild rule mutations. Accept the ones you love, reject the rest.
        </p>
      </div>

      {/* Shake it up + AI generate buttons */}
      <div className="flex justify-center gap-3">
        <motion.div animate={shaking ? { rotate: [0, -10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.5 }}>
          <Button
            size="xl"
            onClick={suggestRule}
            disabled={availableRules.length === 0 || shaking}
            className="group"
          >
            <Shuffle className={`h-5 w-5 mr-2 ${shaking ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {shaking ? "Shaking..." : "Shake It Up!"}
            <Sparkles className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
        <Button
          size="xl"
          variant="outline"
          onClick={suggestAIRule}
          disabled={aiLoading}
          className="text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          {aiLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-5 w-5 mr-2" />
          )}
          {aiLoading ? "Generating..." : "AI Rule"}
        </Button>
      </div>

      {availableRules.length === 0 && !currentSuggestion && (
        <p className="text-center text-sm text-gray-400">
          You&apos;ve seen all available rule mutations! Remove some rejected rules to see them again, or try AI Rule for fresh ideas.
        </p>
      )}

      {/* Current suggestion */}
      <AnimatePresence mode="wait">
        {currentSuggestion && (
          <motion.div
            key={currentSuggestion}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 shadow-lg">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3 mb-4">
                  <Badge className="shrink-0">New Rule</Badge>
                </div>
                <p className="text-gray-800 font-medium text-lg leading-relaxed mb-6">
                  &ldquo;{currentSuggestion}&rdquo;
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleAccept} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Accept Rule
                  </Button>
                  <Button variant="outline" onClick={handleReject} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accepted rules */}
      {acceptedRules.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-500" />
            Accepted Rules ({acceptedRules.length})
          </h3>
          <div className="space-y-2">
            {acceptedRules.map((rule) => (
              <motion.div
                key={rule}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                layout
              >
                <Card className="border-emerald-200 bg-emerald-50/50">
                  <CardContent className="py-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700">{rule}</p>
                    <button
                      onClick={() => removeRule(rule)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
