import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function StepRiskManagement() {
  const { riskConfig, setRiskConfig, setStep } = useStrategyBuilder();
  const patch = (u: Partial<typeof riskConfig>) => setRiskConfig({ ...riskConfig, ...u });

  return (
    <Card>
      <CardHeader><CardTitle>Risk Management</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Risk Per Trade</Label>
            <span className="text-sm font-mono text-primary">{riskConfig.riskPerTrade}%</span>
          </div>
          <Slider value={[riskConfig.riskPerTrade]} onValueChange={([v]) => patch({ riskPerTrade: v })} min={0.1} max={10} step={0.1} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs">Max Concurrent Trades</Label>
            <Input type="number" min={1} value={riskConfig.maxConcurrentTrades} onChange={(e) => patch({ maxConcurrentTrades: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Daily Loss (%)</Label>
            <Input type="number" min={0.1} step={0.1} value={riskConfig.maxDailyLoss} onChange={(e) => patch({ maxDailyLoss: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Max Drawdown (%)</Label>
            <Input type="number" min={0.1} step={0.1} value={riskConfig.maxDrawdown} onChange={(e) => patch({ maxDrawdown: +e.target.value })} />
          </div>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Position Size Calculator</p>
            <p className="text-sm">With {riskConfig.riskPerTrade}% risk and a 20-pip stop loss on a $10,000 account, position size ≈ <span className="font-mono font-bold text-primary">{((10000 * riskConfig.riskPerTrade / 100) / 20 / 10).toFixed(2)} lots</span></p>
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
