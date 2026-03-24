import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";
import { mockVaccinations, mockAppointments, getOwnerById, mockPets } from "@/lib/mock-data";

export default function Reminders() {
  const vaccineDue = mockVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));
  const upcomingAppts = mockAppointments.filter(a => a.status === "Scheduled");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold">Send Reminders</h1>
        <p className="text-muted-foreground text-sm">Notify owners about vaccines and appointments</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Vaccination Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Send</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccineDue.map(v => {
                const pet = mockPets.find(p => p.id === v.petId);
                const owner = pet ? getOwnerById(pet.ownerId) : null;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.petName}</TableCell>
                    <TableCell>{owner?.name || "—"}</TableCell>
                    <TableCell>{v.vaccineType}</TableCell>
                    <TableCell><Badge variant="secondary">{v.nextDue}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm"><Mail className="h-3 w-3 mr-1" /> Email</Button>
                        <Button variant="outline" size="sm"><MessageSquare className="h-3 w-3 mr-1" /> SMS</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Appointment Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Send</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAppts.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.petName}</TableCell>
                  <TableCell>{a.ownerName}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm"><Mail className="h-3 w-3 mr-1" /> Email</Button>
                      <Button variant="outline" size="sm"><MessageSquare className="h-3 w-3 mr-1" /> SMS</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
