import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Generic fetch hook for a table with optional ordering.
export function useRows<T = any>(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean; select?: string }
) {
  const select = opts?.select ?? "*";
  const query = useQuery({
    queryKey: [table, select, opts?.orderBy, opts?.ascending],
    queryFn: async () => {
      let q = supabase.from(table as any).select(select);
      if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
  return query;
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (table: string) => qc.invalidateQueries({ queryKey: [table] });
}
