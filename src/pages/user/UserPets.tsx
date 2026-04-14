import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, Eye, Printer } from "lucide-react";
import { mockPets, getOwnerById, getCheckupsByPet, getVaccinationsByPet, getTreatmentsByPet } from "@/lib/mock-data";
import type { Pet } from "@/lib/mock-data";

const USER_OWNER_ID = "o1";

export default function UserPets() {
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);
  const [viewPet, setViewPet] = useState<Pet | null>(null);

  const handlePrint = (pet: Pet) => {
    const owner = getOwnerById(pet.ownerId);
    const vaccinations = getVaccinationsByPet(pet.id);
    const checkups = getCheckupsByPet(pet.id);
    const treatments = getTreatmentsByPet(pet.id);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Pet Profile - ${pet.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#0d9488;margin-bottom:4px}h3{margin-top:24px;color:#0d9488}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}
      .header{border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:20px}
      .profile{display:flex;align-items:flex-start;gap:20px;margin-bottom:16px}
      .profile .initials{width:100px;height:100px;border-radius:50%;background:#f0fdfa;color:#0d9488;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;border:3px solid #0d9488}
      .profile img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #0d9488}</style></head>
      <body><div class="header"><h1>🩺 Harbourside Veterinary Clinic</h1><p>Pet Profile Report</p></div>
      <div class="profile">
        ${pet.imageUrl ? `<img src="${pet.imageUrl}" alt="${pet.name}" />` : `<div class="initials">${pet.name[0]}</div>`}
        <div>
          <h2 style="margin:0 0 8px">${pet.name}</h2>
          <p><strong>Species:</strong> ${pet.species} | <strong>Breed:</strong> ${pet.breed} |
          <strong>Gender:</strong> ${pet.gender} | <strong>DOB:</strong> ${pet.dob}</p>
          <p><strong>Owner:</strong> ${owner?.name} | <strong>Contact:</strong> ${owner?.contact}</p>
        </div>
      </div>
      <h3>Vaccination Records</h3>
      <table><tr><th>Vaccine</th><th>Date Given</th><th>Next Due</th><th>Notes</th></tr>
      ${vaccinations.map(v => `<tr><td>${v.vaccineType}</td><td>${v.dateGiven}</td><td>${v.nextDue}</td><td>${v.notes}</td></tr>`).join("")}
      </table>
      <h3>Check-up History</h3>
      <table><tr><th>Date</th><th>Vet</th><th>Diagnosis</th></tr>
      ${checkups.map(c => `<tr><td>${c.date}</td><td>${c.vet}</td><td>${c.diagnosis}</td></tr>`).join("")}
      </table>
      <h3>Treatment History</h3>
      <table><tr><th>Treatment</th><th>Date</th><th>Notes</th></tr>
      ${treatments.map(t => `<tr><td>${t.treatment}</td><td>${t.date}</td><td>${t.notes}</td></tr>`).join("")}
      </table>
      <br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold">My Pets</h2>
        <p className="text-muted-foreground text-sm">View your pets' details and history</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userPets.map(pet => (
          <Card key={pet.id} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pet.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {pet.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-heading font-semibold">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">{pet.species} · {pet.breed} · {pet.gender}</p>
                    <p className="text-xs text-muted-foreground">Born: {pet.dob}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setViewPet(pet)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handlePrint(pet)}>
                    <Printer className="h-4 w-4" />
                  </Button>
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

      {/* View Pet Dialog */}
      <Dialog open={!!viewPet} onOpenChange={(open) => !open && setViewPet(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Pet Profile</DialogTitle>
          </DialogHeader>
          {viewPet && (() => {
            const owner = getOwnerById(viewPet.ownerId);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={viewPet.imageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {viewPet.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{viewPet.name}</h3>
                    <p className="text-sm text-muted-foreground">{viewPet.species} · {viewPet.breed} · {viewPet.gender}</p>
                    <p className="text-sm text-muted-foreground">Born: {viewPet.dob}</p>
                    <p className="text-sm text-muted-foreground">Owner: {owner?.name}</p>
                  </div>
                </div>

                <Tabs defaultValue="vaccines">
                  <TabsList className="w-full">
                    <TabsTrigger value="vaccines" className="flex-1 text-xs">Vaccines</TabsTrigger>
                    <TabsTrigger value="checkups" className="flex-1 text-xs">Check-ups</TabsTrigger>
                    <TabsTrigger value="treatments" className="flex-1 text-xs">Treatments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="vaccines" className="mt-3 space-y-1">
                    {getVaccinationsByPet(viewPet.id).length === 0 && <p className="text-sm text-muted-foreground">No records</p>}
                    {getVaccinationsByPet(viewPet.id).map(v => (
                      <div key={v.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{v.vaccineType}</p>
                          <p className="text-xs text-muted-foreground">Given: {v.dateGiven}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Next due</p>
                          <p className="text-sm font-medium">{v.nextDue}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="checkups" className="mt-3 space-y-1">
                    {getCheckupsByPet(viewPet.id).length === 0 && <p className="text-sm text-muted-foreground">No records</p>}
                    {getCheckupsByPet(viewPet.id).map(c => (
                      <div key={c.id} className="text-sm py-2 border-b last:border-0">
                        <div className="flex justify-between">
                          <span className="font-medium">{c.date}</span>
                          <span className="text-muted-foreground">{c.vet}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{c.diagnosis}</p>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="treatments" className="mt-3 space-y-1">
                    {getTreatmentsByPet(viewPet.id).length === 0 && <p className="text-sm text-muted-foreground">No records</p>}
                    {getTreatmentsByPet(viewPet.id).map(t => (
                      <div key={t.id} className="text-sm py-2 border-b last:border-0">
                        <div className="flex justify-between">
                          <span className="font-medium">{t.treatment}</span>
                          <span className="text-muted-foreground">{t.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handlePrint(viewPet)}>
                    <Printer className="h-3 w-3 mr-1" /> Print Profile
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
