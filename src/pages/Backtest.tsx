import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

export default function Backtest() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backtest</h1>
        <p className="text-muted-foreground text-sm">Test your strategies against historical data</p>
      </div>
      <Card>
        <CardContent className="py-20 flex flex-col items-center justify-center text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Backtesting functionality is under development. You'll be able to test your SMC strategies against historical price data to validate performance before going live.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
