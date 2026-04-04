"use client";

import { useState } from "react";
import { Button } from "./button";
import { Wand2, Loader2 } from "lucide-react";

interface AIGenerateButtonProps {
  onGenerate: () => Promise<string | null>;
  onResult: (text: string) => void;
  label?: string;
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function AIGenerateButton({
  onGenerate,
  onResult,
  label = "AI Generate",
  size = "sm",
  className = "",
}: AIGenerateButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await onGenerate();
      if (result) {
        onResult(result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={`text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1.5 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wand2 className="h-3.5 w-3.5" />
      )}
      {size !== "icon" && (loading ? "Generating..." : label)}
    </Button>
  );
}
