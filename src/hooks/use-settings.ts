import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const QUERY_KEY = ["user-settings"] as const;

type SettingsRow = Database["public"]["Tables"]["user_settings"]["Row"];

const DEFAULT_SETTINGS: Omit<SettingsRow, "id" | "user_id" | "created_at" | "updated_at"> = {
  api_key: null,
  api_secret: null,
  webhook_url: null,
  default_risk_per_trade: 1,
  default_max_drawdown: 10,
  notifications: { tradeEntry: true, riskWarnings: true, dailySummary: false },
  theme: "dark",
};

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw new Error(error.message);
      return data ?? null;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: Partial<SettingsRow>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("user_settings").upsert({ user_id: user.id, ...payload });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: "Settings saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const settings: SettingsRow = query.data
    ? query.data
    : ({ ...DEFAULT_SETTINGS, user_id: user?.id ?? "", id: "temp", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as SettingsRow);

  return {
    settings,
    loading: query.isLoading && !!user,
    saveSettings: (payload: Partial<SettingsRow>) => upsertMutation.mutateAsync(payload),
    isSaving: upsertMutation.isPending,
  };
}
