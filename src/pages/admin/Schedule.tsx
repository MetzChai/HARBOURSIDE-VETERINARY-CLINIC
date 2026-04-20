import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Printer } from "lucide-react";
import { mockAppointments, mockPets } from "@/lib/mock-data";
import type { Appointment } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

type Status = Appointment["status"];
const STATUSES: Status[] = ["Scheduled", "Completed", "Missed", "Cancelled"];

const statusVariant = (s: Status) =>
  s === "Completed" ? "default" : s === "Missed" || s === "Cancelled" ? "destructive" : "secondary";

export default function Schedule() {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  const updateStatus = (id: string, status: Status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: "Status updated", description: `Appointment marked as ${status}.` });
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Appointment Schedule</title>
      <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#0d9488}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}</style></head>
      <body><h1>🩺 Harbourside Veterinary Clinic</h1><h2>Appointment Schedule</h2>
      <table><tr><th>Pet</th><th>Owner</th><th>Date</th><th>Time</th><th>Vet</th><th>Reason</th><th>Status</th></tr>
      ${mockAppointments.map(a => `<tr><td>${a.petName}</td><td>${a.ownerName}</td><td>${a.date}</td><td>${a.time}</td><td>${a.vet}</td><td>${a.reason}</td><td>${a.status}</td></tr>`).join("")}
      </table><br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground text-sm">Manage check-up appointments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print Schedule</Button>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Schedule Check-up</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Schedule Check-up</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Pet</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                    <SelectContent>{mockPets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                  <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
                </div>
                <div className="space-y-2"><Label>Veterinarian</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select vet" /></SelectTrigger>
                    <SelectContent><SelectItem value="Dr. Rivera">Dr. Rivera</SelectItem><SelectItem value="Dr. Tan">Dr. Tan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Reason</Label><Input placeholder="e.g. Annual check-up" /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button onClick={() => setShowAdd(false)}>Schedule</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Vet</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAppointments.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.petName}</TableCell>
                  <TableCell>{a.ownerName}</TableCell>
                  <TableCell>{a.date}</TableCell>
                  <TableCell>{a.time}</TableCell>
                  <TableCell>{a.vet}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "Completed" ? "default" : a.status === "Missed" ? "destructive" : "secondary"}>
                      {a.status}
                    </Badge>
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
