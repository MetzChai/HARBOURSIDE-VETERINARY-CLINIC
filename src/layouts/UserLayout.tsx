import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPets, mockVaccinations, getOwnerById } from "@/lib/mock-data";
import ChatbotWidget from "@/components/ChatbotWidget";

const USER_OWNER_ID = "o1";

export default function UserLayout() {
  const owner = getOwnerById(USER_OWNER_ID);
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);
  const userVaccinations = mockVaccinations.filter(v => userPets.some(p => p.id === v.petId));
  const vaccinesDue = userVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));

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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                  {vaccinesDue.length}
                </Badge>
              </Button>
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
