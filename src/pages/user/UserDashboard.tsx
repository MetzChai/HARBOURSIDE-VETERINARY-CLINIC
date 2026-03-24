import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Syringe, Printer, Bell } from "lucide-react";
import { mockPets, mockAppointments, mockVaccinations, getOwnerById, getCheckupsByPet, getVaccinationsByPet, getTreatmentsByPet } from "@/lib/mock-data";
import ChatbotWidget from "@/components/ChatbotWidget";

// Simulating logged-in user is owner "o1" (Maria Santos)
const USER_OWNER_ID = "o1";

export default function UserDashboard() {
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);
  const owner = getOwnerById(USER_OWNER_ID);
  const userAppointments = mockAppointments.filter(a => userPets.some(p => p.name === a.petName));
  const userVaccinations = mockVaccinations.filter(v => userPets.some(p => p.id === v.petId));
  const vaccinesDue = userVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3 no-print">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PawPrint className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-heading font-bold text-sm">Harbourside Veterinary</h1>
              <p className="text-xs text-muted-foreground">Pet Owner Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                {vaccinesDue.length}
              </Badge>
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{owner?.name[0]}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
        <div>
          <h2 className="font-heading text-2xl font-bold">Welcome, {owner?.name}</h2>
          <p className="text-muted-foreground text-sm">Manage your pets and appointments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <div><p className="text-2xl font-bold font-heading">{userPets.length}</p><p className="text-xs text-muted-foreground">My Pets</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
              <div><p className="text-2xl font-bold font-heading">{userAppointments.filter(a => a.status === "Scheduled").length}</p><p className="text-xs text-muted-foreground">Upcoming</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Syringe className="h-6 w-6 text-destructive" />
              </div>
              <div><p className="text-2xl font-bold font-heading">{vaccinesDue.length}</p><p className="text-xs text-muted-foreground">Vaccines Due</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {vaccinesDue.length > 0 && (
          <Card className="border-warning/20 bg-warning/5 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">🔔 Reminders</p>
              {vaccinesDue.map(v => (
                <p key={v.id} className="text-sm text-muted-foreground">
                  {v.petName}'s <strong>{v.vaccineType}</strong> vaccine is due on {v.nextDue}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pets */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="font-heading text-base">My Pets</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPets.map(pet => (
                <Card key={pet.id} className="shadow-none border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PawPrint className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">{pet.species} · {pet.breed} · {pet.gender}</p>
                      </div>
                    </div>
                    <Tabs defaultValue="vaccines" className="mt-2">
                      <TabsList className="h-8">
                        <TabsTrigger value="vaccines" className="text-xs">Vaccines</TabsTrigger>
                        <TabsTrigger value="checkups" className="text-xs">Check-ups</TabsTrigger>
                        <TabsTrigger value="treatments" className="text-xs">Treatments</TabsTrigger>
                      </TabsList>
                      <TabsContent value="vaccines" className="mt-2">
                        {getVaccinationsByPet(pet.id).map(v => (
                          <div key={v.id} className="text-xs flex justify-between py-1 border-b last:border-0">
                            <span>{v.vaccineType}</span><span className="text-muted-foreground">{v.nextDue}</span>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="checkups" className="mt-2">
                        {getCheckupsByPet(pet.id).map(c => (
                          <div key={c.id} className="text-xs py-1 border-b last:border-0">
                            <span className="font-medium">{c.date}</span> — {c.diagnosis}
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="treatments" className="mt-2">
                        {getTreatmentsByPet(pet.id).map(t => (
                          <div key={t.id} className="text-xs py-1 border-b last:border-0">
                            <span className="font-medium">{t.treatment}</span> — {t.notes}
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-base">My Schedule</CardTitle>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> Print</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Pet</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {userAppointments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.petName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell><Badge variant={a.status === "Completed" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <ChatbotWidget />
    </div>
  );
}
