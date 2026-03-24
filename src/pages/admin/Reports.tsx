import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { mockPets, mockOwners, mockVaccinations, mockAppointments, mockInventory } from "@/lib/mock-data";

const reports = [
  { title: "Pet Registry Report", desc: "Complete list of all registered pets", count: mockPets.length },
  { title: "Owner Directory", desc: "All registered pet owners", count: mockOwners.length },
  { title: "Vaccination Report", desc: "All vaccination records", count: mockVaccinations.length },
  { title: "Appointment Report", desc: "All scheduled appointments", count: mockAppointments.length },
  { title: "Inventory Report", desc: "Current vaccine inventory", count: mockInventory.length },
];

export default function Reports() {
  const handlePrint = (type: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    let content = `<h1>🩺 Harbourside Veterinary Clinic</h1><h2>${type}</h2>`;

    if (type.includes("Pet")) {
      content += `<table><tr><th>Name</th><th>Species</th><th>Breed</th><th>Gender</th><th>DOB</th></tr>
      ${mockPets.map(p => `<tr><td>${p.name}</td><td>${p.species}</td><td>${p.breed}</td><td>${p.gender}</td><td>${p.dob}</td></tr>`).join("")}</table>`;
    } else if (type.includes("Owner")) {
      content += `<table><tr><th>Name</th><th>Contact</th><th>Email</th><th>Address</th></tr>
      ${mockOwners.map(o => `<tr><td>${o.name}</td><td>${o.contact}</td><td>${o.email}</td><td>${o.address}</td></tr>`).join("")}</table>`;
    } else if (type.includes("Vaccination")) {
      content += `<table><tr><th>Pet</th><th>Vaccine</th><th>Date</th><th>Next Due</th></tr>
      ${mockVaccinations.map(v => `<tr><td>${v.petName}</td><td>${v.vaccineType}</td><td>${v.dateGiven}</td><td>${v.nextDue}</td></tr>`).join("")}</table>`;
    } else if (type.includes("Appointment")) {
      content += `<table><tr><th>Pet</th><th>Owner</th><th>Date</th><th>Time</th><th>Status</th></tr>
      ${mockAppointments.map(a => `<tr><td>${a.petName}</td><td>${a.ownerName}</td><td>${a.date}</td><td>${a.time}</td><td>${a.status}</td></tr>`).join("")}</table>`;
    } else if (type.includes("Inventory")) {
      content += `<table><tr><th>Vaccine</th><th>Qty</th><th>Expiration</th><th>Status</th></tr>
      ${mockInventory.map(i => `<tr><td>${i.vaccineName}</td><td>${i.quantity}</td><td>${i.expirationDate}</td><td>${i.status}</td></tr>`).join("")}</table>`;
    }

    w.document.write(`<html><head><title>${type}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#0d9488}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}</style></head>
    <body>${content}<br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">Generate and print reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r => (
          <Card key={r.title} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> {r.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{r.desc} ({r.count} records)</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handlePrint(r.title)}>
                <Printer className="h-3 w-3 mr-1" /> Print Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
