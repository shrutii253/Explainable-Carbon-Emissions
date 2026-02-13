import React, { createContext, useContext, useState } from "react";

export type PredictionMode = "explainable" | "baseline";

export interface UserPrediction {
  id: number;
  timestamp: number;
  mode: PredictionMode;
  value: number;
}

interface PredictionHistoryContextValue {
  predictions: UserPrediction[];
  addPrediction: (mode: PredictionMode, value: number) => void;
}

const PredictionHistoryContext = createContext<PredictionHistoryContextValue | undefined>(
  undefined
);

export function PredictionHistoryProvider({ children }: { children: React.ReactNode }) {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);

  const addPrediction = (mode: PredictionMode, value: number) => {
    setPredictions((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      const next: UserPrediction = {
        id: nextId,
        timestamp: Date.now(),
        mode,
        value
      };
      // Keep only the most recent 50 predictions for the mini-trend.
      return [...prev, next].slice(-50);
    });
  };

  return (
    <PredictionHistoryContext.Provider value={{ predictions, addPrediction }}>
      {children}
    </PredictionHistoryContext.Provider>
  );
}

export function usePredictionHistory(): PredictionHistoryContextValue {
  const ctx = useContext(PredictionHistoryContext);
  if (!ctx) {
    throw new Error("usePredictionHistory must be used within a PredictionHistoryProvider");
  }
  return ctx;
}

