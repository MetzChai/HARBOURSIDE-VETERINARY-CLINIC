"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Printer, Syringe } from "lucide-react";
import { mockVaccinations, mockPets } from "@/lib/mock-data";

export default function Vaccinations() {
  const [showAdd, setShowAdd] = useState(false);

  const handlePrintCertificate = (vax: typeof mockVaccinations[0]) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Vaccination Certificate</title>
      <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#0d9488}
      .cert{border:3px solid #0d9488;padding:30px;margin-top:20px;border-radius:12px}
      .header{text-align:center;border-bottom:2px solid #0d9488;padding-bottom:12px}</style></head>
      <body><div class="cert"><div class="header"><h1>🩺 Harbourside Veterinary Clinic</h1>
      <h2>Vaccination Certificate</h2></div>
      <p><strong>Pet:</strong> ${vax.petName}</p>
      <p><strong>Vaccine:</strong> ${vax.vaccineType}</p>
      <p><strong>Date Given:</strong> ${vax.dateGiven}</p>
      <p><strong>Next Due:</strong> ${vax.nextDue}</p>
      <p><strong>Notes:</strong> ${vax.notes || "N/A"}</p>
      <br><p style="color:#999;font-size:12px">This certificate was generated on ${new Date().toLocaleDateString()}</p>
      </div></body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Vaccinations</h1>
          <p className="text-muted-foreground text-sm">Record and manage pet vaccinations</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Record Vaccination</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Record Vaccination</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Select Pet</Label>
                <Select><SelectTrigger><SelectValue placeholder="Choose pet" /></SelectTrigger>
                  <SelectContent>{mockPets.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Vaccine Type</Label><Input placeholder="e.g. Rabies, DHPP" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date Given</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Next Due Date</Label><Input type="date" /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Optional notes" /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button onClick={() => setShowAdd(false)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Date Given</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Print</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVaccinations.map(v => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.petName}</TableCell>
                  <TableCell>{v.vaccineType}</TableCell>
                  <TableCell>{v.dateGiven}</TableCell>
                  <TableCell>{v.nextDue}</TableCell>
                  <TableCell className="text-muted-foreground">{v.notes || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handlePrintCertificate(v)}>
                      <Printer className="h-4 w-4" />
                    </Button>
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

