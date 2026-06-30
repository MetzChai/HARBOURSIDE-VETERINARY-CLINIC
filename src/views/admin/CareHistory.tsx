"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { mockPets, getCheckupsByPet, getVaccinationsByPet, getTreatmentsByPet } from "@/lib/mock-data";

export default function CareHistory() {
  const [selectedPet, setSelectedPet] = useState(mockPets[0]?.id || "");

  const checkups = getCheckupsByPet(selectedPet);
  const vaccinations = getVaccinationsByPet(selectedPet);
  const treatments = getTreatmentsByPet(selectedPet);
  const pet = mockPets.find(p => p.id === selectedPet);

  const handlePrint = (section?: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    let content = `<h1>🩺 Harbourside Veterinary Clinic</h1><h2>Care History: ${pet?.name || ""}</h2>`;

    if (!section || section === "checkups") {
      content += `<h3>Check-ups</h3><table><tr><th>Date</th><th>Vet</th><th>Diagnosis</th></tr>
      ${checkups.map(c => `<tr><td>${c.date}</td><td>${c.vet}</td><td>${c.diagnosis}</td></tr>`).join("")}</table>`;
    }
    if (!section || section === "vaccines") {
      content += `<h3>Vaccinations</h3><table><tr><th>Vaccine</th><th>Date</th><th>Next Due</th></tr>
      ${vaccinations.map(v => `<tr><td>${v.vaccineType}</td><td>${v.dateGiven}</td><td>${v.nextDue}</td></tr>`).join("")}</table>`;
    }
    if (!section || section === "treatments") {
      content += `<h3>Treatments</h3><table><tr><th>Treatment</th><th>Date</th><th>Notes</th></tr>
      ${treatments.map(t => `<tr><td>${t.treatment}</td><td>${t.date}</td><td>${t.notes}</td></tr>`).join("")}</table>`;
    }

    w.document.write(`<html><head><title>Care History - ${pet?.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#0d9488}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}</style></head>
    <body>${content}<br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pet Care History</h1>
          <p className="text-muted-foreground text-sm">View complete medical history</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select pet" /></SelectTrigger>
            <SelectContent>{mockPets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handlePrint()}><Printer className="h-4 w-4 mr-1" /> Print All</Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <Tabs defaultValue="checkups">
            <TabsList>
              <TabsTrigger value="checkups">Check-ups</TabsTrigger>
              <TabsTrigger value="vaccines">Vaccinations</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
            </TabsList>
            <TabsContent value="checkups">
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="sm" onClick={() => handlePrint("checkups")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Vet</TableHead><TableHead>Diagnosis</TableHead></TableRow></TableHeader>
                <TableBody>
                  {checkups.length ? checkups.map(c => (
                    <TableRow key={c.id}><TableCell>{c.date}</TableCell><TableCell>{c.vet}</TableCell><TableCell>{c.diagnosis}</TableCell></TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="vaccines">
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="sm" onClick={() => handlePrint("vaccines")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Vaccine</TableHead><TableHead>Date</TableHead><TableHead>Next Due</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vaccinations.length ? vaccinations.map(v => (
                    <TableRow key={v.id}><TableCell>{v.vaccineType}</TableCell><TableCell>{v.dateGiven}</TableCell><TableCell>{v.nextDue}</TableCell></TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="treatments">
              <div className="flex justify-end mb-2">
                <Button variant="ghost" size="sm" onClick={() => handlePrint("treatments")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Treatment</TableHead><TableHead>Date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                <TableBody>
                  {treatments.length ? treatments.map(t => (
                    <TableRow key={t.id}><TableCell>{t.treatment}</TableCell><TableCell>{t.date}</TableCell><TableCell>{t.notes}</TableCell></TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

