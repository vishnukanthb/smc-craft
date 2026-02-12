import { create } from "zustand";
import type { Strategy, ConditionWithId, ExitConfig, RiskConfig, MarketType, Timeframe } from "@/lib/strategy-types";
import { DEFAULT_EXIT_CONFIG, DEFAULT_RISK_CONFIG } from "@/lib/strategy-types";

interface StrategyBuilderState {
  step: number;
  name: string;
  description: string;
  marketType: MarketType;
  tradingPair: string;
  timeframes: Timeframe[];
  conditions: ConditionWithId[];
  exitConfig: ExitConfig;
  riskConfig: RiskConfig;
  editingId: string | null;

  setStep: (step: number) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setMarketType: (marketType: MarketType) => void;
  setTradingPair: (pair: string) => void;
  setTimeframes: (timeframes: Timeframe[]) => void;
  setConditions: (conditions: ConditionWithId[]) => void;
  addCondition: (condition: ConditionWithId) => void;
  removeCondition: (id: string) => void;
  updateCondition: (id: string, condition: ConditionWithId) => void;
  setExitConfig: (config: ExitConfig) => void;
  setRiskConfig: (config: RiskConfig) => void;
  setEditingId: (id: string | null) => void;
  reset: () => void;
  loadStrategy: (strategy: Strategy) => void;
  toStrategy: () => Omit<Strategy, "id" | "createdAt" | "updatedAt">;
}

export const useStrategyBuilder = create<StrategyBuilderState>((set, get) => ({
  step: 0,
  name: "",
  description: "",
  marketType: "forex",
  tradingPair: "EUR/USD",
  timeframes: ["1H"],
  conditions: [],
  exitConfig: { ...DEFAULT_EXIT_CONFIG },
  riskConfig: { ...DEFAULT_RISK_CONFIG },
  editingId: null,

  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setMarketType: (marketType) => set({ marketType }),
  setTradingPair: (pair) => set({ tradingPair: pair }),
  setTimeframes: (timeframes) => set({ timeframes }),
  setConditions: (conditions) => set({ conditions }),
  addCondition: (condition) => set((s) => ({ conditions: [...s.conditions, condition] })),
  removeCondition: (id) => set((s) => ({ conditions: s.conditions.filter((c) => c.id !== id) })),
  updateCondition: (id, condition) => set((s) => ({ conditions: s.conditions.map((c) => (c.id === id ? condition : c)) })),
  setExitConfig: (exitConfig) => set({ exitConfig }),
  setRiskConfig: (riskConfig) => set({ riskConfig }),
  setEditingId: (editingId) => set({ editingId }),
  reset: () =>
    set({
      step: 0,
      name: "",
      description: "",
      marketType: "forex",
      tradingPair: "EUR/USD",
      timeframes: ["1H"],
      conditions: [],
      exitConfig: { ...DEFAULT_EXIT_CONFIG },
      riskConfig: { ...DEFAULT_RISK_CONFIG },
      editingId: null,
    }),
  loadStrategy: (strategy) =>
    set({
      step: 0,
      name: strategy.name,
      description: strategy.description,
      marketType: strategy.marketType,
      tradingPair: strategy.tradingPair,
      timeframes: strategy.timeframes,
      conditions: strategy.conditions,
      exitConfig: strategy.exitConfig,
      riskConfig: strategy.riskConfig,
      editingId: strategy.id || null,
    }),
  toStrategy: () => {
    const s = get();
    return {
      name: s.name,
      description: s.description,
      marketType: s.marketType,
      tradingPair: s.tradingPair,
      timeframes: s.timeframes,
      conditions: s.conditions,
      exitConfig: s.exitConfig,
      riskConfig: s.riskConfig,
      isActive: false,
    };
  },
}));
