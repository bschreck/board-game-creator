"use client";

import { create } from "zustand";
import { BaseGameId } from "./game-data";

export interface GameState {
  step: number;
  baseGame: BaseGameId | null;
  gameName: string;
  theme: string;
  acceptedRules: string[];
  rejectedRules: string[];
  photos: { url: string; name: string }[];
  tier: "basic" | "premium" | "deluxe";
  boardPreview: string | null;

  setStep: (step: number) => void;
  setBaseGame: (game: BaseGameId) => void;
  setGameName: (name: string) => void;
  setTheme: (theme: string) => void;
  acceptRule: (rule: string) => void;
  rejectRule: (rule: string) => void;
  removeRule: (rule: string) => void;
  addPhoto: (photo: { url: string; name: string }) => void;
  removePhoto: (url: string) => void;
  setTier: (tier: "basic" | "premium" | "deluxe") => void;
  setBoardPreview: (url: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 0,
  baseGame: null as BaseGameId | null,
  gameName: "",
  theme: "",
  acceptedRules: [] as string[],
  rejectedRules: [] as string[],
  photos: [] as { url: string; name: string }[],
  tier: "premium" as const,
  boardPreview: null as string | null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  setStep: (step) => set({ step }),
  setBaseGame: (baseGame) => set({ baseGame }),
  setGameName: (gameName) => set({ gameName }),
  setTheme: (theme) => set({ theme }),
  acceptRule: (rule) =>
    set((state) => ({
      acceptedRules: [...state.acceptedRules, rule],
      rejectedRules: state.rejectedRules.filter((r) => r !== rule),
    })),
  rejectRule: (rule) =>
    set((state) => ({
      rejectedRules: [...state.rejectedRules, rule],
      acceptedRules: state.acceptedRules.filter((r) => r !== rule),
    })),
  removeRule: (rule) =>
    set((state) => ({
      acceptedRules: state.acceptedRules.filter((r) => r !== rule),
      rejectedRules: state.rejectedRules.filter((r) => r !== rule),
    })),
  addPhoto: (photo) =>
    set((state) => ({ photos: [...state.photos, photo] })),
  removePhoto: (url) =>
    set((state) => ({ photos: state.photos.filter((p) => p.url !== url) })),
  setTier: (tier) => set({ tier }),
  setBoardPreview: (boardPreview) => set({ boardPreview }),
  reset: () => set(initialState),
}));
