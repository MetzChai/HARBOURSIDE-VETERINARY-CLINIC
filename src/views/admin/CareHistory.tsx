"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { useRows } from "@/hooks/useRows";
import { formatDate } from "@/lib/age";

export default function CareHistory() {
  const { data: pets = [], isLoading: petsLoading } = useRows<any>("pets", { orderBy: "name" });
  const { data: careRecords = [] } = useRows<any>("care_records", { orderBy: "date", ascending: false });
  const { data: vaccinations = [] } = useRows<any>("vaccinations", { orderBy: "date_given", ascending: false });

  const [selectedPet, setSelectedPet] = useState("");

  const activePet = selectedPet || pets[0]?.id || "";
  const pet = pets.find((p) => p.id === activePet);

  const checkups = careRecords.filter(
    (r) => r.pet_id === activePet && (r.record_type === "checkup" || !r.record_type)
  );
  const treatments = careRecords.filter(
    (r) => r.pet_id === activePet && r.record_type === "treatment"
  );
  const petVaccinations = vaccinations.filter((v) => v.pet_id === activePet);

  const handlePrint = (section?: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    let content = `<h1>Harbourside Veterinary Clinic</h1><h2>Care History: ${pet?.name || ""}</h2>`;

    if (!section || section === "checkups") {
      content += `<h3>Check-ups</h3><table><tr><th>Date</th><th>Vet</th><th>Diagnosis</th></tr>
      ${checkups.map((c) => `<tr><td>${c.date ? formatDate(c.date) : "—"}</td><td>${c.vet ?? "—"}</td><td>${c.diagnosis ?? "—"}</td></tr>`).join("")}</table>`;
    }
    if (!section || section === "vaccines") {
      content += `<h3>Vaccinations</h3><table><tr><th>Vaccine</th><th>Date</th><th>Next Due</th></tr>
      ${petVaccinations.map((v) => `<tr><td>${v.vaccine_type}</td><td>${v.date_given ? formatDate(v.date_given) : "—"}</td><td>${v.next_due ? formatDate(v.next_due) : "—"}</td></tr>`).join("")}</table>`;
    }
    if (!section || section === "treatments") {
      content += `<h3>Treatments</h3><table><tr><th>Treatment</th><th>Date</th><th>Notes</th></tr>
      ${treatments.map((t) => `<tr><td>${t.treatment ?? "—"}</td><td>${t.date ? formatDate(t.date) : "—"}</td><td>${t.notes ?? "—"}</td></tr>`).join("")}</table>`;
    }

    w.document.write(`<html><head><title>Care History - ${pet?.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#ff2400}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#fff0ee;color:#ff2400}</style></head>
    <body>${content}<br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>`);
    w.document.close();
    w.print();
  };

  if (petsLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Pet Care History</h1>
          <p className="text-muted-foreground text-sm">View complete medical history for registered pets</p>
        </div>
        <div className="flex gap-2">
          <Select value={activePet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select pet" /></SelectTrigger>
            <SelectContent>
              {pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handlePrint()} disabled={!activePet}>
            <Printer className="h-4 w-4 mr-1" /> Print All
          </Button>
        </div>
      </div>

      {!activePet ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            No registered pets yet. Add pets to view care history.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <Tabs defaultValue="checkups">
              <TabsList>
                <TabsTrigger value="checkups">Check-ups ({checkups.length})</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccinations ({petVaccinations.length})</TabsTrigger>
                <TabsTrigger value="treatments">Treatments ({treatments.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="checkups">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePrint("checkups")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Vet</TableHead><TableHead>Diagnosis</TableHead><TableHead>Outcome</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {checkups.length ? checkups.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.date ? formatDate(c.date) : "—"}</TableCell>
                        <TableCell>{c.vet ?? "—"}</TableCell>
                        <TableCell>{c.diagnosis ?? "—"}</TableCell>
                        <TableCell>{c.outcome ?? "—"}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="vaccines">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePrint("vaccines")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Vaccine</TableHead><TableHead>Date</TableHead><TableHead>Next Due</TableHead><TableHead>Vet</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {petVaccinations.length ? petVaccinations.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.vaccine_type}</TableCell>
                        <TableCell>{v.date_given ? formatDate(v.date_given) : "—"}</TableCell>
                        <TableCell>{v.next_due ? formatDate(v.next_due) : "—"}</TableCell>
                        <TableCell>{v.vet ?? "—"}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="treatments">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => handlePrint("treatments")}><Printer className="h-3 w-3 mr-1" /> Print</Button>
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>Treatment</TableHead><TableHead>Date</TableHead><TableHead>Medication</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {treatments.length ? treatments.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.treatment ?? "—"}</TableCell>
                        <TableCell>{t.date ? formatDate(t.date) : "—"}</TableCell>
                        <TableCell>{t.medication ?? "—"}</TableCell>
                        <TableCell>{t.notes ?? "—"}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No records</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
