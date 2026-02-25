import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useBacktests } from "@/hooks/use-backtests";

export default function Backtest() {
  const { backtests, loading } = useBacktests();
  const [strategyId, setStrategyId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleRun = () => {
    toast({ title: "Backtest queued", description: "This is a placeholder—execution engine coming soon." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Backtest</h1>
          <p className="text-muted-foreground text-sm">Test your strategies against historical data (beta preview)</p>
        </div>
        <Button onClick={handleRun}>Run Backtest</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs">Strategy</Label>
            <Select value={strategyId} onValueChange={setStrategyId}>
              <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder" disabled>
                  Link to strategies soon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Backtests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full" />
              ))}
            </div>
          ) : backtests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No backtests recorded yet. Configure parameters above and click Run to queue one.</p>
          ) : (
            <div className="space-y-3">
              {backtests.map((bt) => (
                <div key={bt.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{new Date(bt.created_at).toLocaleString()}</span>
                    <span className="text-muted-foreground">{bt.results?.status ?? "pending"}</span>
                  </div>
                  <pre className="mt-2 rounded bg-muted/30 p-2 text-xs overflow-x-auto">{JSON.stringify(bt.results, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
