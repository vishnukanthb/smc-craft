import { useStrategies } from "@/hooks/use-strategies";
import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Edit, Copy, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { CONDITION_LABELS } from "@/lib/strategy-types";

export default function MyStrategies() {
  const { strategies, deleteStrategy, duplicateStrategy, toggleActive } = useStrategies();
  const builder = useStrategyBuilder();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = strategies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (id: string) => {
    const s = strategies.find((s) => s.id === id);
    if (!s) return;
    builder.loadStrategy(s);
    navigate("/builder");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Strategies</h1>
          <p className="text-muted-foreground text-sm">{strategies.length} strategies</p>
        </div>
        <Button onClick={() => { builder.reset(); navigate("/builder"); }}>New Strategy</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search strategies..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No strategies found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                        <Badge variant="outline" className="text-xs">{s.marketType.toUpperCase()}</Badge>
                        <Badge variant="secondary" className="text-xs">{s.tradingPair}</Badge>
                      </div>
                      {s.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{s.description}</p>}
                      <div className="flex flex-wrap gap-1">
                        {s.conditions.slice(0, 3).map((c) => (
                          <Badge key={c.id} variant="outline" className="text-[10px]">{CONDITION_LABELS[c.condition.type]}</Badge>
                        ))}
                        {s.conditions.length > 3 && <Badge variant="outline" className="text-[10px]">+{s.conditions.length - 3}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={s.isActive} onCheckedChange={() => toggleActive(s.id!)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(s.id!)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateStrategy(s.id!)}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteStrategy(s.id!)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
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
