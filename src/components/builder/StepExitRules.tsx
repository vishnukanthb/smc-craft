import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ExitConfig, StopLossType, TakeProfitType } from "@/lib/strategy-types";
import { Plus, Trash2 } from "lucide-react";

type StopLossUnit = ExitConfig["stopLoss"]["unit"];
type TakeProfitUnit = ExitConfig["takeProfit"]["unit"];

export function StepExitRules() {
  const { exitConfig, setExitConfig, setStep } = useStrategyBuilder();
  const { stopLoss, takeProfit, trailingStop, breakEven } = exitConfig;

  const patchSL = (u: Partial<typeof stopLoss>) => setExitConfig({ ...exitConfig, stopLoss: { ...stopLoss, ...u } });
  const patchTP = (u: Partial<typeof takeProfit>) => setExitConfig({ ...exitConfig, takeProfit: { ...takeProfit, ...u } });
  const patchTS = (u: Partial<typeof trailingStop>) => setExitConfig({ ...exitConfig, trailingStop: { ...trailingStop, ...u } });
  const patchBE = (u: Partial<typeof breakEven>) => setExitConfig({ ...exitConfig, breakEven: { ...breakEven, ...u } });

  const addPartial = () => patchTP({ partials: [...takeProfit.partials, { percentage: 50, rrRatio: 1 }] });
  const removePartial = (i: number) => patchTP({ partials: takeProfit.partials.filter((_, idx) => idx !== i) });
  const updatePartial = (i: number, u: Partial<{ percentage: number; rrRatio: number }>) => patchTP({ partials: takeProfit.partials.map((p, idx) => (idx === i ? { ...p, ...u } : p)) });

  return (
    <Card>
      <CardHeader><CardTitle>Exit Rules</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        {/* Stop Loss */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Stop Loss</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={stopLoss.type} onValueChange={(value: StopLossType) => patchSL({ type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="below_ob">Below/Above OB</SelectItem>
                  <SelectItem value="swing">Swing High/Low</SelectItem>
                  <SelectItem value="atr">ATR-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input type="number" value={stopLoss.value} onChange={(e) => patchSL({ value: +e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit</Label>
              <Select value={stopLoss.unit} onValueChange={(value: StopLossUnit) => patchSL({ unit: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pips">Pips</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                  <SelectItem value="multiplier">Multiplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Take Profit */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Take Profit</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={takeProfit.type} onValueChange={(value: TakeProfitType) => patchTP({ type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="rr_ratio">Risk:Reward Ratio</SelectItem>
                  <SelectItem value="opposite_liquidity">Opposite Liquidity</SelectItem>
                  <SelectItem value="partial">Partial TP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {takeProfit.type !== "partial" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input type="number" value={takeProfit.value} onChange={(e) => patchTP({ value: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Unit</Label>
                  <Select value={takeProfit.unit} onValueChange={(value: TakeProfitUnit) => patchTP({ unit: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pips">Pips</SelectItem>
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="ratio">R:R Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          {takeProfit.type === "partial" && (
            <div className="space-y-2">
              {takeProfit.partials.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="number" value={p.percentage} onChange={(e) => updatePartial(i, { percentage: +e.target.value })} className="w-20" />
                  <span className="text-xs text-muted-foreground">% at</span>
                  <Input type="number" value={p.rrRatio} onChange={(e) => updatePartial(i, { rrRatio: +e.target.value })} className="w-20" step={0.1} />
                  <span className="text-xs text-muted-foreground">R:R</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePartial(i)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addPartial}><Plus className="h-3 w-3 mr-1" /> Add Partial</Button>
            </div>
          )}
        </div>

        {/* Trailing Stop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Trailing Stop</h3>
            <Switch checked={trailingStop.enabled} onCheckedChange={(v) => patchTS({ enabled: v })} />
          </div>
          {trailingStop.enabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label className="text-xs">Activation (pips)</Label><Input type="number" value={trailingStop.activationPips} onChange={(e) => patchTS({ activationPips: +e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Trail Distance (pips)</Label><Input type="number" value={trailingStop.trailPips} onChange={(e) => patchTS({ trailPips: +e.target.value })} /></div>
            </div>
          )}
        </div>

        {/* Break Even */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Break Even</h3>
            <Switch checked={breakEven.enabled} onCheckedChange={(v) => patchBE({ enabled: v })} />
          </div>
          {breakEven.enabled && (
            <div className="space-y-1"><Label className="text-xs">Trigger After (pips in profit)</Label><Input type="number" value={breakEven.triggerPips} onChange={(e) => patchBE({ triggerPips: +e.target.value })} /></div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          <Button onClick={() => setStep(3)}>Next: Risk Management</Button>
        </div>
      </CardContent>
    </Card>
  );
}
