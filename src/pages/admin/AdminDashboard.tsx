import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PawPrint, Users, Calendar, Syringe, AlertTriangle, Clock } from "lucide-react";
import { mockPets, mockOwners, mockAppointments, mockVaccinations, mockInventory } from "@/lib/mock-data";

const stats = [
  { label: "Total Pets", value: mockPets.length, icon: PawPrint, color: "text-primary" },
  { label: "Total Owners", value: mockOwners.length, icon: Users, color: "text-blue-500" },
  { label: "Appointments Today", value: mockAppointments.filter(a => a.date === "2026-03-24").length, icon: Calendar, color: "text-amber-500" },
  { label: "Vaccines Due", value: mockVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01")).length, icon: Syringe, color: "text-destructive" },
];

const notifications = [
  { text: "5 vaccines due this week", type: "warning" as const },
  { text: "2 missed appointments", type: "destructive" as const },
  { text: "Low stock: DHPP, Leptospirosis", type: "warning" as const },
  { text: "Bordetella vaccine EXPIRED", type: "destructive" as const },
];

export default function AdminDashboard() {
  const todayAppointments = mockAppointments.filter(a => a.date === "2026-03-24");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Dr. Rivera</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Vet</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.petName}</TableCell>
                    <TableCell>{apt.ownerName}</TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>{apt.vet}</TableCell>
                    <TableCell>
                      <Badge
                        variant={apt.status === "Completed" ? "default" : apt.status === "Missed" ? "destructive" : "secondary"}
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm">{n.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockInventory.filter(i => i.status !== "Available").map(item => (
              <Badge
                key={item.id}
                variant={item.status === "Expired" ? "destructive" : "secondary"}
                className="text-xs py-1 px-3"
              >
                {item.vaccineName}: {item.status} ({item.quantity} left)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
