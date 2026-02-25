import { useStrategyBuilder } from "@/stores/strategy-store";
import { useStrategies } from "@/hooks/use-strategies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntryLogicSummary } from "@/components/builder/EntryLogicSummary";
import { useNavigate } from "react-router-dom";
import { Download, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function StepReview() {
  const store = useStrategyBuilder();
  const { saveStrategy, isSaving } = useStrategies();
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      await saveStrategy(store.toStrategy(), store.editingId);
      store.reset();
      navigate("/strategies");
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(store.toStrategy(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${store.name || "strategy"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Review & Save</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-medium">{store.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Market</p>
            <p className="font-medium">{store.marketType.toUpperCase()} · {store.tradingPair}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Timeframes</p>
            <div className="flex gap-1 flex-wrap">{store.timeframes.map((tf) => <Badge key={tf} variant="secondary" className="text-xs">{tf}</Badge>)}</div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conditions</p>
            <p className="font-medium">{store.conditions.length} condition{store.conditions.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {store.conditions.length > 0 && <EntryLogicSummary conditions={store.conditions} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Stop Loss</p>
              <p className="text-sm">{store.exitConfig.stopLoss.type} — {store.exitConfig.stopLoss.value} {store.exitConfig.stopLoss.unit}</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Take Profit</p>
              <p className="text-sm">{store.exitConfig.takeProfit.type} — {store.exitConfig.takeProfit.type === "partial" ? `${store.exitConfig.takeProfit.partials.length} levels` : `${store.exitConfig.takeProfit.value} ${store.exitConfig.takeProfit.unit}`}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Account Balance</p>
              <p className="text-sm">{currency.format(store.riskConfig.accountBalance)}</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Risk Per Trade</p>
              <p className="text-sm">{store.riskConfig.riskPerTrade}% ({currency.format((store.riskConfig.accountBalance * store.riskConfig.riskPerTrade) / 100)})</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Max Daily Loss</p>
              <p className="text-sm">{store.riskConfig.maxDailyLoss}% ({currency.format((store.riskConfig.accountBalance * store.riskConfig.maxDailyLoss) / 100)})</p>
              <p className="text-xs font-medium text-muted-foreground mt-2">Max Drawdown</p>
              <p className="text-sm">{store.riskConfig.maxDrawdown}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Activate strategy after saving</p>
            <p className="text-xs text-muted-foreground">Toggle to mark this strategy as live immediately</p>
          </div>
          <Switch checked={store.isActive} onCheckedChange={store.setIsActive} />
        </div>

        <div className="flex flex-wrap gap-2 justify-between">
          <Button variant="outline" onClick={() => store.setStep(3)}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export JSON</Button>
            <Button onClick={handleSave} disabled={!store.name || isSaving}>
              <Save className="h-4 w-4 mr-1" /> {store.editingId ? "Update" : "Save"} Strategy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
