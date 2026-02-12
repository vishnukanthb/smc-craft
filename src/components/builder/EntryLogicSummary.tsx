import { Card, CardContent } from "@/components/ui/card";
import { CONDITION_LABELS, type ConditionWithId } from "@/lib/strategy-types";

function describeCondition(c: ConditionWithId["condition"]): string {
  switch (c.type) {
    case "liquidity_sweep": return `Liquidity Sweep (${c.direction})`;
    case "order_block": return `${c.obType === "bullish" ? "Bullish" : "Bearish"} Order Block`;
    case "fair_value_gap": return `${c.fvgType === "bullish" ? "Bullish" : "Bearish"} FVG`;
    case "break_of_structure": return `${c.bosType === "bullish" ? "Bullish" : "Bearish"} BOS`;
    case "change_of_character": return `${c.direction === "bullish" ? "Bullish" : "Bearish"} CHoCH`;
    case "market_structure_shift": return `${c.direction === "bullish" ? "Bullish" : "Bearish"} MSS (${c.timeframe})`;
    case "supply_demand_zone": return `${c.zoneType === "supply" ? "Supply" : "Demand"} Zone (${c.freshness})`;
    case "equal_highs_lows": return c.ehlType === "equal_highs" ? "Equal Highs" : "Equal Lows";
    case "optimal_trade_entry": return `OTE (${c.retracementLevels.join(", ")})`;
    case "session_filter": return `Session: ${c.sessions.map((s) => s.replace("_", " ")).join(", ")}`;
    case "indicator_confluence": {
      const parts: string[] = [];
      if (c.rsiEnabled) parts.push(`RSI ${c.rsiCondition}`);
      if (c.volumeAboveAverage) parts.push("Vol > Avg");
      if (c.emaEnabled) parts.push(`Price ${c.emaCondition} EMA(${c.emaPeriod})`);
      return parts.join(" + ") || "Indicator Confluence";
    }
  }
}

export function EntryLogicSummary({ conditions }: { conditions: ConditionWithId[] }) {
  if (conditions.length === 0) return null;

  const parts = conditions.map((c, i) => {
    const prefix = i === 0 ? "IF " : ` ${c.logicOperator} `;
    return prefix + describeCondition(c.condition);
  });

  const isBullish = conditions.some((c) => {
    const cond = c.condition;
    if ("direction" in cond) return cond.direction === "bullish" || cond.direction === "buy-side";
    if ("obType" in cond) return cond.obType === "bullish";
    if ("bosType" in cond) return cond.bosType === "bullish";
    if ("fvgType" in cond) return cond.fvgType === "bullish";
    if ("zoneType" in cond) return cond.zoneType === "demand";
    return false;
  });

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Entry Logic Summary</p>
        <p className="text-sm font-mono">
          {parts.join("")}
          <span className={isBullish ? "text-trading-buy font-bold" : "text-trading-sell font-bold"}>
            {" → ENTER "}{isBullish ? "LONG" : "SHORT"}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
