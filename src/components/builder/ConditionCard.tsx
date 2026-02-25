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
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  CONDITION_LABELS,
  type ConditionWithId,
  type EntryCondition,
  type LogicOperator,
  type SessionFilterConfig,
  type Timeframe,
} from "@/lib/strategy-types";

interface Props {
  condition: ConditionWithId;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, c: ConditionWithId) => void;
}

const TIMEFRAMES: ReadonlyArray<Timeframe> = ["1m", "5m", "15m", "1H", "4H", "D", "W"];
const FIB_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.705, 0.786, 0.886] as const;
const SESSION_OPTIONS: ReadonlyArray<SessionFilterConfig["sessions"][number]> = [
  "asian",
  "london",
  "new_york",
  "overlap",
];

export function ConditionCard({ condition: cw, index, onRemove, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cw.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const c = cw.condition;

  const updateCondition = (updated: EntryCondition) => onUpdate(cw.id, { ...cw, condition: updated });
  const setLogic = (op: LogicOperator) => onUpdate(cw.id, { ...cw, logicOperator: op });

  return (
    <div ref={setNodeRef} style={style}>
      {index > 0 && (
        <div className="flex justify-center py-1">
          <Badge
            variant="outline"
            className="cursor-pointer text-xs"
            onClick={() => setLogic(cw.logicOperator === "AND" ? "OR" : "AND")}
          >
            {cw.logicOperator}
          </Badge>
        </div>
      )}
      <Card className="border-border">
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <button {...attributes} {...(listeners as unknown)} className="cursor-grab text-muted-foreground hover:text-foreground">
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="flex-1 text-sm font-medium">{CONDITION_LABELS[c.type]}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(cw.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        {expanded && (
          <CardContent className="p-3 grid gap-3 sm:grid-cols-2">
            {renderConditionFields(c, updateCondition)}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function renderConditionFields(condition: EntryCondition, onChange: (config: EntryCondition) => void) {
  switch (condition.type) {
    case "liquidity_sweep": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Direction">
            <Select value={condition.direction} onValueChange={(value: typeof condition.direction) => update({ direction: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy-side">Buy-side</SelectItem>
                <SelectItem value="sell-side">Sell-side</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Lookback (candles)">
            <Input type="number" value={condition.lookbackPeriod} onChange={(e) => update({ lookbackPeriod: Number(e.target.value) })} />
          </Field>
          <SwitchField label="Wick Rejection" checked={condition.requireWickRejection} onChange={(value) => update({ requireWickRejection: value })} />
        </>
      );
    }
    case "order_block": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Type">
            <Select value={condition.obType} onValueChange={(value: typeof condition.obType) => update({ obType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish">Bullish OB</SelectItem>
                <SelectItem value="bearish">Bearish OB</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select value={condition.timeframe} onValueChange={(value: typeof condition.timeframe) => update({ timeframe: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <SwitchField label="Unmitigated Only" checked={condition.mustBeUnmitigated} onChange={(value) => update({ mustBeUnmitigated: value })} />
          <SwitchField label="Require Price Tap" checked={condition.requireTap} onChange={(value) => update({ requireTap: value })} />
        </>
      );
    }
    case "fair_value_gap": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Type">
            <Select value={condition.fvgType} onValueChange={(value: typeof condition.fvgType) => update({ fvgType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish">Bullish FVG</SelectItem>
                <SelectItem value="bearish">Bearish FVG</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Min Gap Size">
            <div className="flex gap-2">
              <Input type="number" value={condition.minGapSize} onChange={(e) => update({ minGapSize: Number(e.target.value) })} className="flex-1" />
              <Select value={condition.gapSizeUnit} onValueChange={(value: typeof condition.gapSizeUnit) => update({ gapSizeUnit: value })}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pips">Pips</SelectItem>
                  <SelectItem value="percent">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Field>
          <Field label="Fill Requirement">
            <Select value={condition.requireFill} onValueChange={(value: typeof condition.requireFill) => update({ requireFill: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    }
    case "break_of_structure": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Type">
            <Select value={condition.bosType} onValueChange={(value: typeof condition.bosType) => update({ bosType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish">Bullish BOS</SelectItem>
                <SelectItem value="bearish">Bearish BOS</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <SwitchField label="Require Body Close" checked={condition.requireBodyClose} onChange={(value) => update({ requireBodyClose: value })} />
        </>
      );
    }
    case "change_of_character": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Direction">
            <Select value={condition.direction} onValueChange={(value: typeof condition.direction) => update({ direction: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish">Bullish</SelectItem>
                <SelectItem value="bearish">Bearish</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Confirmation">
            <Select value={condition.confirmation} onValueChange={(value: typeof condition.confirmation) => update({ confirmation: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="candle_close">Candle Close</SelectItem>
                <SelectItem value="wick">Wick</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    }
    case "market_structure_shift": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Direction">
            <Select value={condition.direction} onValueChange={(value: typeof condition.direction) => update({ direction: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bullish">Bullish</SelectItem>
                <SelectItem value="bearish">Bearish</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select value={condition.timeframe} onValueChange={(value: typeof condition.timeframe) => update({ timeframe: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    }
    case "supply_demand_zone": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Type">
            <Select value={condition.zoneType} onValueChange={(value: typeof condition.zoneType) => update({ zoneType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="supply">Supply</SelectItem>
                <SelectItem value="demand">Demand</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Freshness">
            <Select value={condition.freshness} onValueChange={(value: typeof condition.freshness) => update({ freshness: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fresh">Fresh</SelectItem>
                <SelectItem value="tested_once">Tested Once</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select value={condition.timeframe} onValueChange={(value: typeof condition.timeframe) => update({ timeframe: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      );
    }
    case "equal_highs_lows": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <Field label="Type">
            <Select value={condition.ehlType} onValueChange={(value: typeof condition.ehlType) => update({ ehlType: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equal_highs">Equal Highs</SelectItem>
                <SelectItem value="equal_lows">Equal Lows</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Min Touches">
            <Input type="number" min={2} value={condition.minTouches} onChange={(e) => update({ minTouches: Number(e.target.value) })} />
          </Field>
        </>
      );
    }
    case "optimal_trade_entry": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      const toggleLevel = (level: number) => {
        const exists = condition.retracementLevels.includes(level);
        const nextLevels = exists
          ? condition.retracementLevels.filter((l) => l !== level)
          : [...condition.retracementLevels, level].sort((a, b) => a - b);
        update({ retracementLevels: nextLevels });
      };
      return (
        <div className="sm:col-span-2 space-y-2">
          <Label>Retracement Levels</Label>
          <div className="flex flex-wrap gap-2">
            {FIB_LEVELS.map((lvl) => (
              <Badge
                key={lvl}
                variant={condition.retracementLevels.includes(lvl) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleLevel(lvl)}
              >
                {lvl}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    case "session_filter": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      const toggleSession = (session: SessionFilterConfig["sessions"][number]) => {
        update({
          sessions: condition.sessions.includes(session)
            ? condition.sessions.filter((s) => s !== session)
            : [...condition.sessions, session],
        });
      };
      return (
        <div className="sm:col-span-2 space-y-2">
          <Label>Active Sessions</Label>
          <div className="flex flex-wrap gap-2">
            {SESSION_OPTIONS.map((session) => (
              <Badge
                key={session}
                variant={condition.sessions.includes(session) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleSession(session)}
              >
                {session.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      );
    }
    case "indicator_confluence": {
      const update = (updates: Partial<typeof condition>) => onChange({ ...condition, ...updates });
      return (
        <>
          <SwitchField label="RSI Filter" checked={condition.rsiEnabled} onChange={(value) => update({ rsiEnabled: value })} />
          {condition.rsiEnabled && (
            <>
              <Field label="RSI Condition">
                <Select value={condition.rsiCondition} onValueChange={(value: typeof condition.rsiCondition) => update({ rsiCondition: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overbought">Overbought</SelectItem>
                    <SelectItem value="oversold">Oversold</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="RSI Threshold">
                <Input type="number" value={condition.rsiThreshold} onChange={(e) => update({ rsiThreshold: Number(e.target.value) })} />
              </Field>
            </>
          )}
          <SwitchField label="Volume Above Average" checked={condition.volumeAboveAverage} onChange={(value) => update({ volumeAboveAverage: value })} />
          <SwitchField label="EMA Filter" checked={condition.emaEnabled} onChange={(value) => update({ emaEnabled: value })} />
          {condition.emaEnabled && (
            <>
              <Field label="EMA Period">
                <Input type="number" value={condition.emaPeriod} onChange={(e) => update({ emaPeriod: Number(e.target.value) })} />
              </Field>
              <Field label="Price vs EMA">
                <Select value={condition.emaCondition} onValueChange={(value: typeof condition.emaCondition) => update({ emaCondition: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
        </>
      );
    }
    default:
      return null;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SwitchField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
