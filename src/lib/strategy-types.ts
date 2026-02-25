export type MarketType = "forex" | "crypto" | "stocks";
export type Timeframe = "1m" | "5m" | "15m" | "1H" | "4H" | "D" | "W";
export type LogicOperator = "AND" | "OR";

export interface LiquiditySweepConfig {
  type: "liquidity_sweep";
  direction: "buy-side" | "sell-side";
  lookbackPeriod: number;
  requireWickRejection: boolean;
}

export interface OrderBlockConfig {
  type: "order_block";
  obType: "bullish" | "bearish";
  mustBeUnmitigated: boolean;
  timeframe: Timeframe;
  requireTap: boolean;
}

export interface FairValueGapConfig {
  type: "fair_value_gap";
  fvgType: "bullish" | "bearish";
  minGapSize: number;
  gapSizeUnit: "pips" | "percent";
  requireFill: "none" | "partial" | "full";
}

export interface BreakOfStructureConfig {
  type: "break_of_structure";
  bosType: "bullish" | "bearish";
  requireBodyClose: boolean;
}

export interface ChangeOfCharacterConfig {
  type: "change_of_character";
  direction: "bullish" | "bearish";
  confirmation: "candle_close" | "wick";
}

export interface MarketStructureShiftConfig {
  type: "market_structure_shift";
  direction: "bullish" | "bearish";
  timeframe: Timeframe;
}

export interface SupplyDemandZoneConfig {
  type: "supply_demand_zone";
  zoneType: "supply" | "demand";
  freshness: "fresh" | "tested_once" | "any";
  timeframe: Timeframe;
}

export interface EqualHighsLowsConfig {
  type: "equal_highs_lows";
  ehlType: "equal_highs" | "equal_lows";
  minTouches: number;
}

export interface OptimalTradeEntryConfig {
  type: "optimal_trade_entry";
  retracementLevels: number[];
}

export interface SessionFilterConfig {
  type: "session_filter";
  sessions: ("asian" | "london" | "new_york" | "overlap")[];
}

export interface IndicatorConfluenceConfig {
  type: "indicator_confluence";
  rsiEnabled: boolean;
  rsiThreshold: number;
  rsiCondition: "overbought" | "oversold";
  volumeAboveAverage: boolean;
  emaEnabled: boolean;
  emaPeriod: number;
  emaCondition: "above" | "below";
}

export type EntryCondition =
  | LiquiditySweepConfig
  | OrderBlockConfig
  | FairValueGapConfig
  | BreakOfStructureConfig
  | ChangeOfCharacterConfig
  | MarketStructureShiftConfig
  | SupplyDemandZoneConfig
  | EqualHighsLowsConfig
  | OptimalTradeEntryConfig
  | SessionFilterConfig
  | IndicatorConfluenceConfig;

export interface ConditionWithId {
  id: string;
  condition: EntryCondition;
  logicOperator: LogicOperator;
}

export type StopLossType = "fixed" | "below_ob" | "swing" | "atr";
export type TakeProfitType = "fixed" | "rr_ratio" | "opposite_liquidity" | "partial";

export interface StopLossConfig {
  type: StopLossType;
  value: number;
  unit: "pips" | "percent" | "multiplier";
}

export interface PartialTP {
  percentage: number;
  rrRatio: number;
}

export interface TakeProfitConfig {
  type: TakeProfitType;
  value: number;
  unit: "pips" | "percent" | "ratio";
  partials: PartialTP[];
}

export interface TrailingStopConfig {
  enabled: boolean;
  activationPips: number;
  trailPips: number;
}

export interface BreakEvenConfig {
  enabled: boolean;
  triggerPips: number;
}

export interface ExitConfig {
  stopLoss: StopLossConfig;
  takeProfit: TakeProfitConfig;
  trailingStop: TrailingStopConfig;
  breakEven: BreakEvenConfig;
}

export interface RiskConfig {
  accountBalance: number;
  riskPerTrade: number;
  stopLossPips: number;
  maxConcurrentTrades: number;
  maxDailyLoss: number;
  maxDrawdown: number;
}

export interface Strategy {
  id?: string;
  name: string;
  description: string;
  marketType: MarketType;
  tradingPair: string;
  timeframes: Timeframe[];
  conditions: ConditionWithId[];
  exitConfig: ExitConfig;
  riskConfig: RiskConfig;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_EXIT_CONFIG: ExitConfig = {
  stopLoss: { type: "fixed", value: 20, unit: "pips" },
  takeProfit: { type: "rr_ratio", value: 2, unit: "ratio", partials: [] },
  trailingStop: { enabled: false, activationPips: 30, trailPips: 10 },
  breakEven: { enabled: false, triggerPips: 20 },
};

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  accountBalance: 10000,
  riskPerTrade: 1,
  stopLossPips: 20,
  maxConcurrentTrades: 3,
  maxDailyLoss: 5,
  maxDrawdown: 10,
};

export const CONDITION_LABELS: Record<EntryCondition["type"], string> = {
  liquidity_sweep: "Liquidity Sweep",
  order_block: "Order Block",
  fair_value_gap: "Fair Value Gap (FVG)",
  break_of_structure: "Break of Structure (BOS)",
  change_of_character: "Change of Character (CHoCH)",
  market_structure_shift: "Market Structure Shift (MSS)",
  supply_demand_zone: "Supply / Demand Zone",
  equal_highs_lows: "Equal Highs / Lows",
  optimal_trade_entry: "Optimal Trade Entry (OTE)",
  session_filter: "Session Filter",
  indicator_confluence: "Indicator Confluence",
};

export const TRADING_PAIRS: Record<MarketType, string[]> = {
  forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY", "EUR/JPY", "USD/CHF"],
  crypto: ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT", "ADA/USDT", "DOGE/USDT", "DOT/USDT", "AVAX/USDT", "MATIC/USDT"],
  stocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "SPY"],
};

export const STRATEGY_TEMPLATES: Omit<Strategy, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "London Killzone OB + FVG",
    description: "Enters on bullish order block with fair value gap confluence during London session",
    marketType: "forex",
    tradingPair: "EUR/USD",
    timeframes: ["15m", "1H"],
    conditions: [
      { id: "1", logicOperator: "AND", condition: { type: "session_filter", sessions: ["london"] } },
      { id: "2", logicOperator: "AND", condition: { type: "order_block", obType: "bullish", mustBeUnmitigated: true, timeframe: "1H", requireTap: true } },
      { id: "3", logicOperator: "AND", condition: { type: "fair_value_gap", fvgType: "bullish", minGapSize: 10, gapSizeUnit: "pips", requireFill: "partial" } },
    ],
    exitConfig: { stopLoss: { type: "below_ob", value: 5, unit: "pips" }, takeProfit: { type: "rr_ratio", value: 3, unit: "ratio", partials: [] }, trailingStop: { enabled: false, activationPips: 30, trailPips: 10 }, breakEven: { enabled: true, triggerPips: 15 } },
    riskConfig: { accountBalance: 25000, riskPerTrade: 1, stopLossPips: 8, maxConcurrentTrades: 2, maxDailyLoss: 3, maxDrawdown: 8 },
    isActive: false,
  },
  {
    name: "Liquidity Sweep Reversal",
    description: "Catches reversals after sell-side liquidity sweeps with change of character confirmation",
    marketType: "crypto",
    tradingPair: "BTC/USDT",
    timeframes: ["5m", "15m"],
    conditions: [
      { id: "1", logicOperator: "AND", condition: { type: "liquidity_sweep", direction: "sell-side", lookbackPeriod: 50, requireWickRejection: true } },
      { id: "2", logicOperator: "AND", condition: { type: "change_of_character", direction: "bullish", confirmation: "candle_close" } },
      { id: "3", logicOperator: "AND", condition: { type: "supply_demand_zone", zoneType: "demand", freshness: "fresh", timeframe: "15m" } },
    ],
    exitConfig: { stopLoss: { type: "swing", value: 3, unit: "pips" }, takeProfit: { type: "opposite_liquidity", value: 0, unit: "pips", partials: [] }, trailingStop: { enabled: true, activationPips: 50, trailPips: 20 }, breakEven: { enabled: true, triggerPips: 25 } },
    riskConfig: { accountBalance: 10000, riskPerTrade: 0.5, stopLossPips: 40, maxConcurrentTrades: 2, maxDailyLoss: 2, maxDrawdown: 6 },
    isActive: false,
  },
  {
    name: "BOS + OTE Sniper Entry",
    description: "Precision entry using break of structure and optimal trade entry Fibonacci levels",
    marketType: "forex",
    tradingPair: "GBP/USD",
    timeframes: ["15m", "4H"],
    conditions: [
      { id: "1", logicOperator: "AND", condition: { type: "break_of_structure", bosType: "bullish", requireBodyClose: true } },
      { id: "2", logicOperator: "AND", condition: { type: "optimal_trade_entry", retracementLevels: [0.618, 0.705] } },
      { id: "3", logicOperator: "AND", condition: { type: "indicator_confluence", rsiEnabled: true, rsiThreshold: 30, rsiCondition: "oversold", volumeAboveAverage: true, emaEnabled: false, emaPeriod: 21, emaCondition: "above" } },
    ],
    exitConfig: { stopLoss: { type: "fixed", value: 15, unit: "pips" }, takeProfit: { type: "rr_ratio", value: 3, unit: "ratio", partials: [] }, trailingStop: { enabled: false, activationPips: 30, trailPips: 10 }, breakEven: { enabled: true, triggerPips: 10 } },
    riskConfig: { accountBalance: 15000, riskPerTrade: 1, stopLossPips: 15, maxConcurrentTrades: 3, maxDailyLoss: 4, maxDrawdown: 10 },
    isActive: false,
  },
  {
    name: "NY Session Breaker Block",
    description: "Trades breaker blocks during New York overlap for high-probability reversals",
    marketType: "forex",
    tradingPair: "USD/JPY",
    timeframes: ["5m", "1H"],
    conditions: [
      { id: "1", logicOperator: "AND", condition: { type: "session_filter", sessions: ["new_york", "overlap"] } },
      { id: "2", logicOperator: "AND", condition: { type: "market_structure_shift", direction: "bullish", timeframe: "1H" } },
      { id: "3", logicOperator: "AND", condition: { type: "order_block", obType: "bullish", mustBeUnmitigated: true, timeframe: "5m", requireTap: true } },
      { id: "4", logicOperator: "AND", condition: { type: "fair_value_gap", fvgType: "bullish", minGapSize: 5, gapSizeUnit: "pips", requireFill: "none" } },
    ],
    exitConfig: { stopLoss: { type: "below_ob", value: 3, unit: "pips" }, takeProfit: { type: "partial", value: 0, unit: "ratio", partials: [{ percentage: 50, rrRatio: 1 }, { percentage: 50, rrRatio: 2 }] }, trailingStop: { enabled: true, activationPips: 20, trailPips: 8 }, breakEven: { enabled: false, triggerPips: 15 } },
    riskConfig: { accountBalance: 20000, riskPerTrade: 1.5, stopLossPips: 10, maxConcurrentTrades: 2, maxDailyLoss: 4, maxDrawdown: 8 },
    isActive: false,
  },
  {
    name: "EQH Sweep + Supply Zone",
    description: "Fades equal highs liquidity pools with supply zone confirmation for short entries",
    marketType: "crypto",
    tradingPair: "ETH/USDT",
    timeframes: ["15m", "4H"],
    conditions: [
      { id: "1", logicOperator: "AND", condition: { type: "equal_highs_lows", ehlType: "equal_highs", minTouches: 3 } },
      { id: "2", logicOperator: "AND", condition: { type: "liquidity_sweep", direction: "buy-side", lookbackPeriod: 100, requireWickRejection: true } },
      { id: "3", logicOperator: "AND", condition: { type: "supply_demand_zone", zoneType: "supply", freshness: "fresh", timeframe: "4H" } },
    ],
    exitConfig: { stopLoss: { type: "atr", value: 1.5, unit: "multiplier" }, takeProfit: { type: "rr_ratio", value: 2.5, unit: "ratio", partials: [] }, trailingStop: { enabled: true, activationPips: 40, trailPips: 15 }, breakEven: { enabled: true, triggerPips: 20 } },
    riskConfig: { accountBalance: 12000, riskPerTrade: 1, stopLossPips: 25, maxConcurrentTrades: 2, maxDailyLoss: 3, maxDrawdown: 7 },
    isActive: false,
  },
];
