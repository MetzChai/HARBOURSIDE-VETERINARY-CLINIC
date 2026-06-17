import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// All queries below are automatically scoped to the logged-in user by RLS.
export function useMyOwner() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-owner", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owners")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyPets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-pets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-appointments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, pets(name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyVaccinations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-vaccinations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccinations")
        .select("*, pets(name)")
        .order("next_due", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyCareRecords() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-care-records", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("care_records")
        .select("*, pets(name)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
