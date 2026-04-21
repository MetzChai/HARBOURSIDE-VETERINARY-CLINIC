import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Outlet } from "react-router-dom";
import NotificationBell, { NotificationItem } from "@/components/NotificationBell";
import { mockVaccinations, mockAppointments, mockInventory } from "@/lib/mock-data";

export default function AdminLayout() {
  const vaccinesDue = mockVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));
  const missedAppts = mockAppointments.filter(a => a.status === "Missed");
  const inventoryAlerts = mockInventory.filter(i => i.status !== "Available");

  const notifications: NotificationItem[] = [
    ...vaccinesDue.map(v => ({
      id: `vac-${v.id}`,
      title: `${v.petName} — ${v.vaccineType} due`,
      description: `Next dose scheduled for ${v.nextDue}`,
      type: "vaccine" as const,
      time: v.nextDue,
    })),
    ...missedAppts.map(a => ({
      id: `apt-${a.id}`,
      title: `Missed appointment: ${a.petName}`,
      description: `${a.ownerName} • ${a.date} at ${a.time}`,
      type: "appointment" as const,
      time: a.date,
    })),
    ...inventoryAlerts.map(i => ({
      id: `inv-${i.id}`,
      title: `${i.vaccineName}: ${i.status}`,
      description: `${i.quantity} units remaining • Expires ${i.expirationDate}`,
      type: i.status === "Expired" ? ("alert" as const) : ("inventory" as const),
      time: i.expirationDate,
    })),
  ];

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
                  <span className="text-xs font-bold text-primary">DR</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">Dr. Rivera</p>
                  <p className="text-xs text-muted-foreground">Veterinarian</p>
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
