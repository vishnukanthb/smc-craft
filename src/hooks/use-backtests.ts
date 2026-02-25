import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

const QUERY_KEY = ["backtest-results"] as const;

type BacktestRow = Database["public"]["Tables"]["backtest_results"]["Row"];

export function useBacktests() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: QUERY_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backtest_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  return {
    backtests: query.data ?? ([] as BacktestRow[]),
    loading: query.isLoading && !!user,
    error: query.error as Error | null,
  };
}
