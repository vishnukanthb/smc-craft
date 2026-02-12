import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRADING_PAIRS, type MarketType, type Timeframe } from "@/lib/strategy-types";

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "D", "W"];

export function StepBasicInfo() {
  const { name, setName, description, setDescription, marketType, setMarketType, tradingPair, setTradingPair, timeframes, setTimeframes, setStep } = useStrategyBuilder();

  const pairs = TRADING_PAIRS[marketType];

  const toggleTF = (tf: Timeframe) => {
    setTimeframes(timeframes.includes(tf) ? timeframes.filter((t) => t !== tf) : [...timeframes, tf]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Strategy Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. London OB Reversal" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your strategy..." rows={3} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Market Type</Label>
            <Select value={marketType} onValueChange={(v) => { setMarketType(v as MarketType); setTradingPair(TRADING_PAIRS[v as MarketType][0]); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trading Pair</Label>
            <Select value={tradingPair} onValueChange={setTradingPair}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {pairs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Timeframes</Label>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((tf) => (
              <Badge
                key={tf}
                variant={timeframes.includes(tf) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTF(tf)}
              >
                {tf}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setStep(1)} disabled={!name || timeframes.length === 0}>Next: Entry Conditions</Button>
        </div>
      </CardContent>
    </Card>
  );
}
