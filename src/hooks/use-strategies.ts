import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { DEFAULT_EXIT_CONFIG, DEFAULT_RISK_CONFIG } from "@/lib/strategy-types";
import type { Strategy } from "@/lib/strategy-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type StrategyRow = Database["public"]["Tables"]["strategies"]["Row"];

type StrategyConfigPayload = {
  timeframes?: Strategy["timeframes"];
  conditions?: Strategy["conditions"];
  exitConfig?: Partial<Strategy["exitConfig"]>;
  riskConfig?: Partial<Strategy["riskConfig"]>;
};

function strategyFromRow(row: StrategyRow): Strategy {
  const config = (row.config || {}) as StrategyConfigPayload;
  const exitConfig = { ...DEFAULT_EXIT_CONFIG, ...(config.exitConfig || {}) };
  const riskConfig = { ...DEFAULT_RISK_CONFIG, ...(config.riskConfig || {}) };
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    marketType: row.market_type as Strategy["marketType"],
    tradingPair: row.trading_pair,
    timeframes: config.timeframes || [],
    conditions: config.conditions || [],
    exitConfig,
    riskConfig,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildConfig(strategy: Omit<Strategy, "id" | "createdAt" | "updatedAt">): Json {
  return {
    timeframes: strategy.timeframes,
    conditions: strategy.conditions,
    exitConfig: strategy.exitConfig,
    riskConfig: strategy.riskConfig,
  } as Json;
}

const STRATEGIES_QUERY_KEY = ["strategies"] as const;

type SaveArgs = {
  strategy: Omit<Strategy, "id" | "createdAt" | "updatedAt">;
  editId?: string | null;
};

export function useStrategies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = [...STRATEGIES_QUERY_KEY, user?.id] as const;

  const strategiesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data || []).map(strategyFromRow);
    },
    enabled: !!user,
    staleTime: 1000 * 30,
    placeholderData: [] as Strategy[],
  });

  const saveMutation = useMutation({
    mutationFn: async ({ strategy, editId }: SaveArgs) => {
      if (!user) throw new Error("You must be signed in to save strategies.");
      const config = buildConfig(strategy);

      if (editId) {
        const { error } = await supabase
          .from("strategies")
          .update({
            name: strategy.name,
            description: strategy.description,
            market_type: strategy.marketType,
            trading_pair: strategy.tradingPair,
            config,
            is_active: strategy.isActive,
          })
          .eq("id", editId);
        if (error) throw new Error(error.message);
        return "updated" as const;
      }

      const { error } = await supabase.from("strategies").insert({
        user_id: user.id,
        name: strategy.name,
        description: strategy.description,
        market_type: strategy.marketType,
        trading_pair: strategy.tradingPair,
        config,
        is_active: strategy.isActive,
      });
      if (error) throw new Error(error.message);
      return "created" as const;
    },
    onSuccess: (action) => {
      toast({ title: action === "updated" ? "Strategy updated" : "Strategy saved" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategies").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Strategy deleted" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("You must be signed in to duplicate strategies.");
      const current = queryClient.getQueryData<Strategy[]>(queryKey) || [];
      const target = current.find((s) => s.id === id);
      if (!target) throw new Error("Strategy not found.");

      const config = buildConfig(target);
      const { error } = await supabase.from("strategies").insert({
        user_id: user.id,
        name: `${target.name} (Copy)` ,
        description: target.description,
        market_type: target.marketType,
        trading_pair: target.tradingPair,
        config,
        is_active: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Strategy duplicated" });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = queryClient.getQueryData<Strategy[]>(queryKey) || [];
      const target = current.find((s) => s.id === id);
      if (!target) throw new Error("Strategy not found.");
      const { error } = await supabase.from("strategies").update({ is_active: !target.isActive }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    strategies: strategiesQuery.data ?? [],
    loading: strategiesQuery.isLoading && !!user,
    saveStrategy: (strategy: Omit<Strategy, "id" | "createdAt" | "updatedAt">, editId?: string | null) =>
      saveMutation.mutateAsync({ strategy, editId }),
    deleteStrategy: (id: string) => deleteMutation.mutateAsync(id),
    duplicateStrategy: (id: string) => duplicateMutation.mutateAsync(id),
    toggleActive: (id: string) => toggleMutation.mutateAsync(id),
    isSaving: saveMutation.isPending,
  };
}
