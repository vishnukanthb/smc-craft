import type { Strategy } from "@/lib/strategy-types";
import { STRATEGY_TEMPLATES, CONDITION_LABELS } from "@/lib/strategy-types";
import { useStrategyBuilder } from "@/stores/strategy-store";
import { useStrategies } from "@/hooks/use-strategies";
import { useStrategyTemplates } from "@/hooks/use-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Templates() {
  const builder = useStrategyBuilder();
  const { saveStrategy } = useStrategies();
  const { templates, loading } = useStrategyTemplates();
  const navigate = useNavigate();

  const dataset = templates.length > 0 ? templates : STRATEGY_TEMPLATES;

  const handleClone = async (idx: number) => {
    const tpl = dataset[idx];
    try {
      await saveStrategy(tpl);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCustomize = (idx: number) => {
    const tpl = dataset[idx];
    const strategy: Strategy = { ...tpl, id: undefined, createdAt: undefined, updatedAt: undefined };
    builder.loadStrategy(strategy);
    navigate("/builder");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Strategy Templates</h1>
        <p className="text-muted-foreground text-sm">Pre-built SMC strategies you can clone and customize</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dataset.map((tpl, i) => (
            <motion.div key={tpl.id ?? tpl.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{tpl.marketType.toUpperCase()}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{tpl.tradingPair}</Badge>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {tpl.conditions.map((c) => (
                      <Badge key={c.id} variant="outline" className="text-[10px]">{CONDITION_LABELS[c.condition.type]}</Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleClone(i)}><Copy className="h-3 w-3 mr-1" /> Clone</Button>
                    <Button size="sm" className="flex-1" onClick={() => handleCustomize(i)}><Wrench className="h-3 w-3 mr-1" /> Customize</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
