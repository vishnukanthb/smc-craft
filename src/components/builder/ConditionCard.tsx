import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { CONDITION_LABELS, type ConditionWithId, type LogicOperator, type Timeframe } from "@/lib/strategy-types";
import { cn } from "@/lib/utils";

interface Props {
  condition: ConditionWithId;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, c: ConditionWithId) => void;
}

const TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "D", "W"];
const FIB_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 0.886];

export function ConditionCard({ condition: cw, index, onRemove, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cw.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const c = cw.condition;

  const patch = (updates: Partial<typeof c>) => onUpdate(cw.id, { ...cw, condition: { ...c, ...updates } as any });
  const setLogic = (op: LogicOperator) => onUpdate(cw.id, { ...cw, logicOperator: op });

  return (
    <div ref={setNodeRef} style={style}>
      {index > 0 && (
        <div className="flex justify-center py-1">
          <Badge variant="outline" className="cursor-pointer text-xs" onClick={() => setLogic(cw.logicOperator === "AND" ? "OR" : "AND")}>
            {cw.logicOperator}
          </Badge>
        </div>
      )}
      <Card className="border-border">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground"><GripVertical className="h-4 w-4" /></button>
          <span className="flex-1 text-sm font-medium">{CONDITION_LABELS[c.type]}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(cw.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {expanded && (
          <CardContent className="p-3 grid gap-3 sm:grid-cols-2">
            {c.type === "liquidity_sweep" && (
              <>
                <Field label="Direction">
                  <Select value={c.direction} onValueChange={(v) => patch({ direction: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="buy-side">Buy-side</SelectItem><SelectItem value="sell-side">Sell-side</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Lookback (candles)">
                  <Input type="number" value={c.lookbackPeriod} onChange={(e) => patch({ lookbackPeriod: +e.target.value })} />
                </Field>
                <SwitchField label="Wick Rejection" checked={c.requireWickRejection} onChange={(v) => patch({ requireWickRejection: v })} />
              </>
            )}
            {c.type === "order_block" && (
              <>
                <Field label="Type">
                  <Select value={c.obType} onValueChange={(v) => patch({ obType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bullish">Bullish OB</SelectItem><SelectItem value="bearish">Bearish OB</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Timeframe">
                  <Select value={c.timeframe} onValueChange={(v) => patch({ timeframe: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </Field>
                <SwitchField label="Unmitigated Only" checked={c.mustBeUnmitigated} onChange={(v) => patch({ mustBeUnmitigated: v })} />
                <SwitchField label="Require Price Tap" checked={c.requireTap} onChange={(v) => patch({ requireTap: v })} />
              </>
            )}
            {c.type === "fair_value_gap" && (
              <>
                <Field label="Type">
                  <Select value={c.fvgType} onValueChange={(v) => patch({ fvgType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bullish">Bullish FVG</SelectItem><SelectItem value="bearish">Bearish FVG</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Min Gap Size">
                  <div className="flex gap-2"><Input type="number" value={c.minGapSize} onChange={(e) => patch({ minGapSize: +e.target.value })} className="flex-1" /><Select value={c.gapSizeUnit} onValueChange={(v) => patch({ gapSizeUnit: v as any })}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pips">Pips</SelectItem><SelectItem value="percent">%</SelectItem></SelectContent></Select></div>
                </Field>
                <Field label="Fill Requirement">
                  <Select value={c.requireFill} onValueChange={(v) => patch({ requireFill: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="partial">Partial Fill</SelectItem><SelectItem value="full">Full Fill</SelectItem></SelectContent></Select>
                </Field>
              </>
            )}
            {c.type === "break_of_structure" && (
              <>
                <Field label="Type">
                  <Select value={c.bosType} onValueChange={(v) => patch({ bosType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bullish">Bullish BOS</SelectItem><SelectItem value="bearish">Bearish BOS</SelectItem></SelectContent></Select>
                </Field>
                <SwitchField label="Require Body Close" checked={c.requireBodyClose} onChange={(v) => patch({ requireBodyClose: v })} />
              </>
            )}
            {c.type === "change_of_character" && (
              <>
                <Field label="Direction">
                  <Select value={c.direction} onValueChange={(v) => patch({ direction: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bullish">Bullish</SelectItem><SelectItem value="bearish">Bearish</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Confirmation">
                  <Select value={c.confirmation} onValueChange={(v) => patch({ confirmation: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="candle_close">Candle Close</SelectItem><SelectItem value="wick">Wick</SelectItem></SelectContent></Select>
                </Field>
              </>
            )}
            {c.type === "market_structure_shift" && (
              <>
                <Field label="Direction">
                  <Select value={c.direction} onValueChange={(v) => patch({ direction: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bullish">Bullish</SelectItem><SelectItem value="bearish">Bearish</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Timeframe">
                  <Select value={c.timeframe} onValueChange={(v) => patch({ timeframe: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </Field>
              </>
            )}
            {c.type === "supply_demand_zone" && (
              <>
                <Field label="Type">
                  <Select value={c.zoneType} onValueChange={(v) => patch({ zoneType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="supply">Supply</SelectItem><SelectItem value="demand">Demand</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Freshness">
                  <Select value={c.freshness} onValueChange={(v) => patch({ freshness: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fresh">Fresh</SelectItem><SelectItem value="tested_once">Tested Once</SelectItem><SelectItem value="any">Any</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Timeframe">
                  <Select value={c.timeframe} onValueChange={(v) => patch({ timeframe: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEFRAMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                </Field>
              </>
            )}
            {c.type === "equal_highs_lows" && (
              <>
                <Field label="Type">
                  <Select value={c.ehlType} onValueChange={(v) => patch({ ehlType: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="equal_highs">Equal Highs</SelectItem><SelectItem value="equal_lows">Equal Lows</SelectItem></SelectContent></Select>
                </Field>
                <Field label="Min Touches">
                  <Input type="number" min={2} value={c.minTouches} onChange={(e) => patch({ minTouches: +e.target.value })} />
                </Field>
              </>
            )}
            {c.type === "optimal_trade_entry" && (
              <div className="sm:col-span-2 space-y-2">
                <Label>Retracement Levels</Label>
                <div className="flex flex-wrap gap-2">
                  {FIB_LEVELS.map((lvl) => (
                    <Badge
                      key={lvl}
                      variant={c.retracementLevels.includes(lvl) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => patch({ retracementLevels: c.retracementLevels.includes(lvl) ? c.retracementLevels.filter((l) => l !== lvl) : [...c.retracementLevels, lvl] })}
                    >
                      {lvl}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {c.type === "session_filter" && (
              <div className="sm:col-span-2 space-y-2">
                <Label>Active Sessions</Label>
                <div className="flex flex-wrap gap-2">
                  {(["asian", "london", "new_york", "overlap"] as const).map((s) => (
                    <Badge
                      key={s}
                      variant={c.sessions.includes(s) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => patch({ sessions: c.sessions.includes(s) ? c.sessions.filter((x) => x !== s) : [...c.sessions, s] })}
                    >
                      {s.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {c.type === "indicator_confluence" && (
              <>
                <SwitchField label="RSI Filter" checked={c.rsiEnabled} onChange={(v) => patch({ rsiEnabled: v })} />
                {c.rsiEnabled && (
                  <>
                    <Field label="RSI Condition">
                      <Select value={c.rsiCondition} onValueChange={(v) => patch({ rsiCondition: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="overbought">Overbought</SelectItem><SelectItem value="oversold">Oversold</SelectItem></SelectContent></Select>
                    </Field>
                    <Field label="RSI Threshold">
                      <Input type="number" value={c.rsiThreshold} onChange={(e) => patch({ rsiThreshold: +e.target.value })} />
                    </Field>
                  </>
                )}
                <SwitchField label="Volume Above Avg" checked={c.volumeAboveAverage} onChange={(v) => patch({ volumeAboveAverage: v })} />
                <SwitchField label="EMA Filter" checked={c.emaEnabled} onChange={(v) => patch({ emaEnabled: v })} />
                {c.emaEnabled && (
                  <>
                    <Field label="EMA Period">
                      <Input type="number" value={c.emaPeriod} onChange={(e) => patch({ emaPeriod: +e.target.value })} />
                    </Field>
                    <Field label="Price vs EMA">
                      <Select value={c.emaCondition} onValueChange={(v) => patch({ emaCondition: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="above">Above</SelectItem><SelectItem value="below">Below</SelectItem></SelectContent></Select>
                    </Field>
                  </>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}

function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between"><Label className="text-xs">{label}</Label><Switch checked={checked} onCheckedChange={onChange} /></div>;
}
