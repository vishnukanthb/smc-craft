import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Zap, FolderOpen } from "lucide-react";
import { useStrategies } from "@/hooks/use-strategies";
import { useBacktests } from "@/hooks/use-backtests";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { strategies, loading: strategiesLoading } = useStrategies();
  const { backtests, loading: backtestsLoading } = useBacktests();
  const active = strategies.filter((s) => s.isActive).length;

  const cards = [
    { label: "Total Strategies", value: strategies.length, loading: strategiesLoading, icon: FolderOpen, color: "text-primary" },
    { label: "Active", value: active, loading: strategiesLoading, icon: Zap, color: "text-trading-buy" },
    { label: "Backtests Ran", value: backtests.length, loading: backtestsLoading, icon: TrendingUp, color: "text-trading-accent" },
    { label: "Last Backtest", value: backtests[0]?.created_at ? new Date(backtests[0].created_at).toLocaleDateString() : "—", loading: backtestsLoading, icon: BarChart3, color: "text-trading-accent" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your trading strategies</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {card.loading ? <Skeleton className="h-7 w-16" /> : <div className="text-2xl font-bold">{card.value}</div>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          {strategiesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
            </div>
          ) : strategies.length === 0 ? (
            <p className="text-muted-foreground text-sm">No strategies yet. Head to the Strategy Builder to create one!</p>
          ) : (
            <div className="space-y-3">
              {strategies.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.marketType.toUpperCase()} · {s.tradingPair}</p>
                  </div>
                  <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
