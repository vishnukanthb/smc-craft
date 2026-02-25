import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_EXIT_CONFIG, DEFAULT_RISK_CONFIG } from "@/lib/strategy-types";
import type { Strategy } from "@/lib/strategy-types";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = ["strategy-templates"] as const;

type TemplateRow = Database["public"]["Tables"]["strategy_templates"]["Row"];

type StrategyConfigPayload = {
  timeframes?: Strategy["timeframes"];
  conditions?: Strategy["conditions"];
  exitConfig?: Partial<Strategy["exitConfig"]>;
  riskConfig?: Partial<Strategy["riskConfig"]>;
};

function mapTemplateRow(row: TemplateRow): Strategy {
  const config = (row.config || {}) as StrategyConfigPayload;
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    marketType: row.market_type as Strategy["marketType"],
    tradingPair: row.trading_pair,
    timeframes: config.timeframes || [],
    conditions: config.conditions || [],
    exitConfig: { ...DEFAULT_EXIT_CONFIG, ...(config.exitConfig || {}) },
    riskConfig: { ...DEFAULT_RISK_CONFIG, ...(config.riskConfig || {}) },
    isActive: false,
    createdAt: row.created_at,
    updatedAt: row.created_at,
  };
}

export function useStrategyTemplates() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategy_templates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []).map(mapTemplateRow);
    },
  });

  return {
    templates: query.data ?? [],
    loading: query.isLoading && !!user,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
