import { useState, useEffect, useCallback } from "react";
import type { Strategy } from "@/lib/strategy-types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Json } from "@/integrations/supabase/types";

function strategyFromRow(row: any): Strategy {
  const config = row.config as any;
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    marketType: row.market_type,
    tradingPair: row.trading_pair,
    timeframes: config.timeframes || [],
    conditions: config.conditions || [],
    exitConfig: config.exitConfig || {},
    riskConfig: config.riskConfig || {},
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useStrategies() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStrategies = useCallback(async () => {
    if (!user) { setStrategies([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("strategies")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return; }
    setStrategies((data || []).map(strategyFromRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStrategies(); }, [fetchStrategies]);

  const saveStrategy = useCallback(async (strategy: Omit<Strategy, "id" | "createdAt" | "updatedAt">, editId?: string | null) => {
    if (!user) return;
    const config: Json = {
      timeframes: strategy.timeframes,
      conditions: strategy.conditions as unknown as Json,
      exitConfig: strategy.exitConfig as unknown as Json,
      riskConfig: strategy.riskConfig as unknown as Json,
    };

    if (editId) {
      const { error } = await supabase.from("strategies").update({
        name: strategy.name,
        description: strategy.description,
        market_type: strategy.marketType,
        trading_pair: strategy.tradingPair,
        config,
        is_active: strategy.isActive,
      }).eq("id", editId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Strategy updated" });
    } else {
      const { error } = await supabase.from("strategies").insert({
        user_id: user.id,
        name: strategy.name,
        description: strategy.description,
        market_type: strategy.marketType,
        trading_pair: strategy.tradingPair,
        config,
        is_active: strategy.isActive,
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Strategy saved" });
    }
    fetchStrategies();
  }, [user, fetchStrategies]);

  const deleteStrategy = useCallback(async (id: string) => {
    const { error } = await supabase.from("strategies").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Strategy deleted" });
    fetchStrategies();
  }, [fetchStrategies]);

  const duplicateStrategy = useCallback(async (id: string) => {
    const target = strategies.find((s) => s.id === id);
    if (!target || !user) return;
    const config: Json = {
      timeframes: target.timeframes,
      conditions: target.conditions as unknown as Json,
      exitConfig: target.exitConfig as unknown as Json,
      riskConfig: target.riskConfig as unknown as Json,
    };
    const { error } = await supabase.from("strategies").insert({
      user_id: user.id,
      name: `${target.name} (Copy)`,
      description: target.description,
      market_type: target.marketType,
      trading_pair: target.tradingPair,
      config,
      is_active: false,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Strategy duplicated" });
    fetchStrategies();
  }, [strategies, user, fetchStrategies]);

  const toggleActive = useCallback(async (id: string) => {
    const target = strategies.find((s) => s.id === id);
    if (!target) return;
    await supabase.from("strategies").update({ is_active: !target.isActive }).eq("id", id);
    fetchStrategies();
  }, [strategies, fetchStrategies]);

  return { strategies, loading, saveStrategy, deleteStrategy, duplicateStrategy, toggleActive };
}
