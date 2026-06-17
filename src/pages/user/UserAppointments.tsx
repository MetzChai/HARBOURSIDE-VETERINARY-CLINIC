import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useMyAppointments } from "@/hooks/useOwnerData";

export default function UserAppointments() {
  const { data: appointments = [] } = useMyAppointments();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">My Appointments</h2>
          <p className="text-muted-foreground text-sm">View your upcoming and past appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-3 w-3 mr-1" /> Print</Button>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Vet</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No appointments yet.</TableCell></TableRow>
              )}
              {appointments.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.pets?.name}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell>{a.vet}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell><Badge variant={a.status === "completed" ? "default" : "secondary"}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
