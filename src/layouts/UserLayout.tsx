import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { Outlet } from "react-router-dom";
import { mockPets, mockVaccinations, mockAppointments, getOwnerById } from "@/lib/mock-data";
import ChatbotWidget from "@/components/ChatbotWidget";
import NotificationBell, { NotificationItem } from "@/components/NotificationBell";

const USER_OWNER_ID = "o1";

export default function UserLayout() {
  const owner = getOwnerById(USER_OWNER_ID);
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);
  const userVaccinations = mockVaccinations.filter(v => userPets.some(p => p.id === v.petId));
  const vaccinesDue = userVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));
  const userAppts = mockAppointments.filter(a => userPets.some(p => p.name === a.petName) && a.status === "Scheduled");

  const notifications: NotificationItem[] = [
    ...vaccinesDue.map(v => ({
      id: `vac-${v.id}`,
      title: `${v.petName}'s ${v.vaccineType} vaccine due`,
      description: `Schedule a visit by ${v.nextDue}`,
      type: "vaccine" as const,
      time: v.nextDue,
    })),
    ...userAppts.map(a => ({
      id: `apt-${a.id}`,
      title: `Upcoming: ${a.petName}`,
      description: `${a.reason} with ${a.vet} • ${a.date} at ${a.time}`,
      type: "appointment" as const,
      time: a.date,
    })),
  ];

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
                  <span className="text-xs font-bold text-primary">{owner?.name[0]}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{owner?.name}</p>
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
