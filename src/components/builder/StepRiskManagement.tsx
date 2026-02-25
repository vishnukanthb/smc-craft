import { useMemo } from "react";
import type { MarketType } from "@/lib/strategy-types";
import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function pipValueForMarket(market: MarketType) {
  switch (market) {
    case "crypto":
      return 5; // assumes $5 per "pip"/point on a standard contract
    case "stocks":
      return 1;
    default:
      return 10; // forex standard lot
  }
}

export function StepRiskManagement() {
  const { riskConfig, setRiskConfig, setStep, marketType } = useStrategyBuilder();
  const patch = (u: Partial<typeof riskConfig>) => setRiskConfig({ ...riskConfig, ...u });

  const { riskAmount, lotSize, maxDailyLossValue, maxDrawdownValue } = useMemo(() => {
    const riskAmountRaw = (riskConfig.accountBalance * riskConfig.riskPerTrade) / 100;
    const pipValue = pipValueForMarket(marketType);
    const lots = riskConfig.stopLossPips > 0 ? riskAmountRaw / (riskConfig.stopLossPips * pipValue) : 0;
    return {
      riskAmount: riskAmountRaw,
      lotSize: Math.max(0, lots),
      maxDailyLossValue: (riskConfig.accountBalance * riskConfig.maxDailyLoss) / 100,
      maxDrawdownValue: (riskConfig.accountBalance * riskConfig.maxDrawdown) / 100,
    };
  }, [riskConfig, marketType]);

  return (
    <Card>
      <CardHeader><CardTitle>Risk Management</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">Account Balance (USD)</Label>
            <Input type="number" min={1000} step={500} value={riskConfig.accountBalance} onChange={(e) => patch({ accountBalance: Number(e.target.value) })} />
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {[10000, 25000, 50000].map((preset) => (
                <Button key={preset} type="button" size="sm" variant="secondary" className="h-7 px-3" onClick={() => patch({ accountBalance: preset })}>
                  {currency.format(preset)}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Average Stop Loss Distance (pips / points)</Label>
            <Input type="number" min={1} step={1} value={riskConfig.stopLossPips} onChange={(e) => patch({ stopLossPips: Number(e.target.value) })} />
            <p className="text-xs text-muted-foreground">Used for the position-size calculator below.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Risk Per Trade</Label>
            <span className="text-sm font-mono text-primary">{riskConfig.riskPerTrade.toFixed(1)}%</span>
          </div>
          <Slider value={[riskConfig.riskPerTrade]} onValueChange={([v]) => patch({ riskPerTrade: Number(v.toFixed(1)) })} min={0.1} max={10} step={0.1} />
          <p className="text-xs text-muted-foreground">Risking {currency.format(riskAmount)} per trade.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs">Max Concurrent Trades</Label>
            <Input type="number" min={1} value={riskConfig.maxConcurrentTrades} onChange={(e) => patch({ maxConcurrentTrades: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Daily Loss (%)</Label>
            <Input type="number" min={0.5} step={0.5} value={riskConfig.maxDailyLoss} onChange={(e) => patch({ maxDailyLoss: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Drawdown (%)</Label>
            <Input type="number" min={1} step={0.5} value={riskConfig.maxDrawdown} onChange={(e) => patch({ maxDrawdown: Number(e.target.value) })} />
          </div>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Position Size</p>
              <p className="text-2xl font-bold text-primary">{lotSize > 0 ? lotSize.toFixed(2) : "0.00"} lots</p>
              <p className="text-xs text-muted-foreground">Based on risk amount ÷ (stop-loss × pip value).</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Daily & Drawdown Stops</p>
              <p className="text-sm">Daily stop: <span className="font-semibold">{currency.format(maxDailyLossValue)}</span></p>
              <p className="text-sm">Drawdown cap: <span className="font-semibold">{currency.format(maxDrawdownValue)}</span></p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
          <Button onClick={() => setStep(4)}>Next: Review & Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}
