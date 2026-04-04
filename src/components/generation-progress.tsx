"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ScrollText,
  Layers,
  Box,
  Grid3X3,
  BookOpen,
  Printer,
} from "lucide-react";

interface GenerationStatus {
  jobId?: string;
  status: string;
  phase: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  error?: string;
  tgcGameId?: string;
  tgcOrderId?: string;
  startedAt?: string;
  completedAt?: string;
}

const PHASE_CONFIG: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  queued: { icon: <Loader2 className="h-5 w-5 animate-spin" />, label: "Queued", description: "Waiting to start..." },
  rules: { icon: <ScrollText className="h-5 w-5" />, label: "Generating Rules", description: "Writing complete rules document and card definitions..." },
  cards: { icon: <Layers className="h-5 w-5" />, label: "Creating Cards", description: "Generating individual card artwork and text..." },
  "box-art": { icon: <Box className="h-5 w-5" />, label: "Designing Box Art", description: "Creating front and back box cover artwork..." },
  board: { icon: <Grid3X3 className="h-5 w-5" />, label: "Creating Game Board", description: "Generating the full game board illustration..." },
  manual: { icon: <BookOpen className="h-5 w-5" />, label: "Building Manual", description: "Designing printable instruction manual pages..." },
  "print-submit": { icon: <Printer className="h-5 w-5" />, label: "Submitting to Printer", description: "Uploading assets and placing print order..." },
  complete: { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, label: "Complete", description: "Your game is being printed!" },
};

const PHASES_ORDER = ["rules", "cards", "box-art", "board", "manual", "print-submit"];

export function GenerationProgress({ gameId }: { gameId: string }) {
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [polling, setPolling] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/generation-status?gameId=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.status === "complete" || data.status === "failed" || data.status === "none") {
          setPolling(false);
        }
      }
    } catch {
      // Silently retry
    }
  }, [gameId]);

  useEffect(() => {
    fetchStatus();
    if (!polling) return;
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, polling]);

  if (!status || status.status === "none") return null;

  const phaseConfig = PHASE_CONFIG[status.phase] || PHASE_CONFIG.queued;
  const currentPhaseIndex = PHASES_ORDER.indexOf(status.phase);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${status.status === "failed" ? "bg-red-100" : status.status === "complete" ? "bg-emerald-100" : "bg-violet-100"}`}>
            {status.status === "failed" ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <span className={status.status === "complete" ? "text-emerald-600" : "text-violet-600"}>
                {phaseConfig.icon}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {status.status === "failed" ? "Generation Failed" : phaseConfig.label}
            </h3>
            <p className="text-sm text-gray-500">
              {status.status === "failed" ? status.error : phaseConfig.description}
            </p>
          </div>
          <span className="text-lg font-bold text-violet-600">{status.progress}%</span>
        </div>

        {/* Progress bar */}
        <Progress value={status.progress} />

        {/* Phase indicators */}
        <div className="flex justify-between">
          {PHASES_ORDER.map((phase, i) => {
            const config = PHASE_CONFIG[phase];
            const isComplete = i < currentPhaseIndex || status.status === "complete";
            const isCurrent = phase === status.phase && status.status !== "complete";
            return (
              <div key={phase} className="flex flex-col items-center gap-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isComplete ? "done" : isCurrent ? "active" : "pending"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      isComplete
                        ? "bg-emerald-100 text-emerald-600"
                        : isCurrent
                          ? "bg-violet-100 text-violet-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-[10px]">{config.icon}</span>
                    )}
                  </motion.div>
                </AnimatePresence>
                <span className={`text-[10px] ${isCurrent ? "text-violet-600 font-medium" : "text-gray-400"}`}>
                  {config.label.split(" ").slice(-1)[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* TGC tracking info */}
        {status.tgcOrderId && (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            Print Order: <span className="font-mono text-gray-700">{status.tgcOrderId}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
