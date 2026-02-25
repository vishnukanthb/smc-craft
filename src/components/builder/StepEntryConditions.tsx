import { useState } from "react";
import { useStrategyBuilder } from "@/stores/strategy-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConditionCard } from "@/components/builder/ConditionCard";
import { EntryLogicSummary } from "@/components/builder/EntryLogicSummary";
import { CONDITION_LABELS, type EntryCondition } from "@/lib/strategy-types";
import { Plus } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

const CONDITION_TYPES = Object.keys(CONDITION_LABELS) as EntryCondition["type"][];

function createDefault(type: EntryCondition["type"]): EntryCondition {
  switch (type) {
    case "liquidity_sweep": return { type, direction: "sell-side", lookbackPeriod: 50, requireWickRejection: true };
    case "order_block": return { type, obType: "bullish", mustBeUnmitigated: true, timeframe: "1H", requireTap: true };
    case "fair_value_gap": return { type, fvgType: "bullish", minGapSize: 10, gapSizeUnit: "pips", requireFill: "partial" };
    case "break_of_structure": return { type, bosType: "bullish", requireBodyClose: true };
    case "change_of_character": return { type, direction: "bullish", confirmation: "candle_close" };
    case "market_structure_shift": return { type, direction: "bullish", timeframe: "1H" };
    case "supply_demand_zone": return { type, zoneType: "demand", freshness: "fresh", timeframe: "1H" };
    case "equal_highs_lows": return { type, ehlType: "equal_lows", minTouches: 2 };
    case "optimal_trade_entry": return { type, retracementLevels: [0.618, 0.705] };
    case "session_filter": return { type, sessions: ["london"] };
    case "indicator_confluence": return { type, rsiEnabled: true, rsiThreshold: 30, rsiCondition: "oversold", volumeAboveAverage: false, emaEnabled: false, emaPeriod: 21, emaCondition: "above" };
  }
}

export function StepEntryConditions() {
  const { conditions, setConditions, addCondition, removeCondition, updateCondition, setStep } = useStrategyBuilder();
  const [selectedType, setSelectedType] = useState<EntryCondition["type"]>("liquidity_sweep");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleAdd = () => {
    addCondition({ id: crypto.randomUUID(), condition: createDefault(selectedType), logicOperator: "AND" });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = conditions.findIndex((c) => c.id === active.id);
    const newIdx = conditions.findIndex((c) => c.id === over.id);
    setConditions(arrayMove(conditions, oldIdx, newIdx));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EntryCondition["type"])}>
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONDITION_TYPES.map((t) => <SelectItem key={t} value={t}>{CONDITION_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} size="icon"><Plus className="h-4 w-4" /></Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={conditions.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <ConditionCard key={c.id} condition={c} index={i} onRemove={removeCondition} onUpdate={updateCondition} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {conditions.length > 0 && <EntryLogicSummary conditions={conditions} />}

        {conditions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Add entry conditions to build your strategy logic</p>}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
          <Button onClick={() => setStep(2)} disabled={conditions.length === 0}>Next: Exit Rules</Button>
        </div>
      </CardContent>
    </Card>
  );
}
