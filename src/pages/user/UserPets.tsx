import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PawPrint } from "lucide-react";
import { mockPets, getCheckupsByPet, getVaccinationsByPet, getTreatmentsByPet } from "@/lib/mock-data";

const USER_OWNER_ID = "o1";

export default function UserPets() {
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);

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
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold">{pet.name}</p>
                  <p className="text-xs text-muted-foreground">{pet.species} · {pet.breed} · {pet.gender}</p>
                  <p className="text-xs text-muted-foreground">Born: {pet.dob}</p>
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
    </div>
  );
}
