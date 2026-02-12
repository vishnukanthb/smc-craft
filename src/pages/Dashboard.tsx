import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Zap, FolderOpen } from "lucide-react";
import { useStrategies } from "@/hooks/use-strategies";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { strategies } = useStrategies();
  const active = strategies.filter((s) => s.isActive).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your trading strategies</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Strategies", value: strategies.length, icon: FolderOpen, color: "text-primary" },
          { label: "Active", value: active, icon: Zap, color: "text-trading-buy" },
          { label: "Win Rate", value: "—", icon: TrendingUp, color: "text-trading-accent" },
          { label: "Avg R:R", value: "—", icon: BarChart3, color: "text-trading-accent" },
        ].map((card) => (
          <motion.div key={card.label} variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
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
          {strategies.length === 0 ? (
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
