import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockPets, mockVaccinations } from "@/lib/mock-data";

const USER_OWNER_ID = "o1";

export default function UserVaccinations() {
  const userPets = mockPets.filter(p => p.ownerId === USER_OWNER_ID);
  const userVaccinations = mockVaccinations.filter(v => userPets.some(p => p.id === v.petId));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold">Vaccinations</h2>
        <p className="text-muted-foreground text-sm">Track your pets' vaccination records</p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Date Given</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userVaccinations.map(v => {
                const isDue = new Date(v.nextDue) <= new Date("2026-04-01");
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.petName}</TableCell>
                    <TableCell>{v.vaccineType}</TableCell>
                    <TableCell>{v.dateGiven}</TableCell>
                    <TableCell>{v.nextDue}</TableCell>
                    <TableCell>
                      <Badge variant={isDue ? "destructive" : "default"}>
                        {isDue ? "Due" : "Up to date"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
