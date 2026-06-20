import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";
import NotificationBell, { NotificationItem } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminLayout() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: vaccinations = [] } = useQuery({
    queryKey: ["admin-vac-alerts"],
    queryFn: async () => {
      const { data } = await supabase.from("vaccinations").select("*, pets(name)");
      return data ?? [];
    },
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["admin-inv-alerts"],
    queryFn: async () => {
      const { data } = await supabase.from("inventory_items").select("*");
      return data ?? [];
    },
  });

  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);
  const vaccinesDue = vaccinations.filter((v: any) => v.next_due && new Date(v.next_due) <= in30);
  const inventoryAlerts = inventory.filter((i: any) => (i.quantity ?? 0) <= 5);

  const notifications: NotificationItem[] = [
    ...vaccinesDue.map((v: any) => ({
      id: `vac-${v.id}`,
      title: `${v.pets?.name ?? "Pet"} — ${v.vaccine_type} due`,
      description: `Next dose scheduled for ${v.next_due}`,
      type: "vaccine" as const,
      time: v.next_due,
    })),
    ...inventoryAlerts.map((i: any) => ({
      id: `inv-${i.id}`,
      title: `${i.name}: Low stock`,
      description: `${i.quantity} units remaining`,
      type: "inventory" as const,
      time: i.expiration_date ?? "",
    })),
  ];

  const displayName = profile?.full_name ?? user?.email ?? "Staff";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 no-print">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground font-medium">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell notifications={notifications} />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{displayName[0]?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Veterinary Staff</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
