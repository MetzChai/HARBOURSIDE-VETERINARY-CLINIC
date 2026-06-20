import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { Outlet } from "react-router-dom";
import ChatbotWidget from "@/components/ChatbotWidget";
import NotificationBell, { NotificationItem } from "@/components/NotificationBell";
import { useMyOwner, useMyPets, useMyAppointments, useMyVaccinations } from "@/hooks/useOwnerData";
import { useAuth } from "@/hooks/useAuth";

export default function UserLayout() {
  const { user } = useAuth();
  const { data: owner } = useMyOwner();
  const { data: pets = [] } = useMyPets();
  const { data: appointments = [] } = useMyAppointments();
  const { data: vaccinations = [] } = useMyVaccinations();

  const today = new Date();
  const in30 = new Date();
  in30.setDate(today.getDate() + 30);

  const vaccinesDue = vaccinations.filter((v: any) => v.next_due && new Date(v.next_due) <= in30);
  const upcoming = appointments.filter((a: any) => (a.status ?? "").toLowerCase() === "scheduled");

  const notifications: NotificationItem[] = [
    ...vaccinesDue.map((v: any) => ({
      id: `vac-${v.id}`,
      title: `${v.pets?.name ?? "Pet"}'s ${v.vaccine_type} vaccine due`,
      description: `Schedule a visit by ${v.next_due}`,
      type: "vaccine" as const,
      time: v.next_due,
    })),
    ...upcoming.map((a: any) => ({
      id: `apt-${a.id}`,
      title: `Upcoming: ${a.pets?.name ?? "Pet"}`,
      description: `${a.reason ?? "Visit"} • ${a.date} at ${a.time}`,
      type: "appointment" as const,
      time: a.date,
    })),
  ];

  const displayName = owner?.name ?? user?.email ?? "Pet Owner";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UserSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 no-print">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground font-medium">Pet Owner Portal</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell notifications={notifications} />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{displayName[0]?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Pet Owner</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatbotWidget />
    </SidebarProvider>
  );
}
