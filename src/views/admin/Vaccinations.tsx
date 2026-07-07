"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Printer, Syringe, Search, Loader2 } from "lucide-react";
import { db } from "@/lib/db-client";
import { useRows, useInvalidate } from "@/hooks/useRows";
import { formatDate } from "@/lib/age";
import { toast } from "sonner";

type VaxForm = {
  pet_id: string;
  vaccine_type: string;
  date_given: string;
  next_due: string;
  vet: string;
  notes: string;
};

const emptyForm: VaxForm = {
  pet_id: "",
  vaccine_type: "",
  date_given: "",
  next_due: "",
  vet: "",
  notes: "",
};

export default function Vaccinations() {
  const { data: rows = [], isLoading } = useRows<any>("vaccinations", { orderBy: "date_given", ascending: false });
  const { data: pets = [] } = useRows<any>("pets", { orderBy: "name" });
  const invalidate = useInvalidate();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VaxForm>(emptyForm);

  const petName = (id: string) => pets.find((p) => p.id === id)?.name ?? "—";

  const filtered = rows.filter((v) =>
    petName(v.pet_id).toLowerCase().includes(search.toLowerCase()) ||
    (v.vaccine_type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!form.pet_id || !form.vaccine_type.trim()) {
      toast.error("Pet and vaccine type are required");
      return;
    }
    setSaving(true);
    const { error } = await db.from("vaccinations").insert({
      pet_id: form.pet_id,
      vaccine_type: form.vaccine_type.trim(),
      date_given: form.date_given || null,
      next_due: form.next_due || null,
      vet: form.vet || null,
      notes: form.notes || null,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Vaccination recorded");
    setShowAdd(false);
    setForm(emptyForm);
    invalidate("vaccinations");
  };

  const handlePrintCertificate = (vax: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Vaccination Certificate</title>
      <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#ff2400}
      .cert{border:3px solid #ff2400;padding:30px;margin-top:20px;border-radius:12px}
      .header{text-align:center;border-bottom:2px solid #ff2400;padding-bottom:12px}</style></head>
      <body><div class="cert"><div class="header"><h1>Harbourside Veterinary Clinic</h1>
      <h2>Vaccination Certificate</h2></div>
      <p><strong>Pet:</strong> ${petName(vax.pet_id)}</p>
      <p><strong>Vaccine:</strong> ${vax.vaccine_type}</p>
      <p><strong>Date Given:</strong> ${vax.date_given ? formatDate(vax.date_given) : "—"}</p>
      <p><strong>Next Due:</strong> ${vax.next_due ? formatDate(vax.next_due) : "—"}</p>
      <p><strong>Vet:</strong> ${vax.vet ?? "—"}</p>
      <p><strong>Notes:</strong> ${vax.notes || "N/A"}</p>
      <br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p>
      </div></body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Syringe className="h-6 w-6 text-primary" /> Vaccinations
          </h1>
          <p className="text-muted-foreground text-sm">Record vaccinations for registered pets</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Record Vaccination</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Record Vaccination</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Select Pet</Label>
                <Select value={form.pet_id} onValueChange={(v) => setForm({ ...form, pet_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose pet" /></SelectTrigger>
                  <SelectContent>
                    {pets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.species ?? "—"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Vaccine Type</Label>
                <Input value={form.vaccine_type} onChange={(e) => setForm({ ...form, vaccine_type: e.target.value })} placeholder="e.g. Rabies, DHPP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date Given</Label>
                  <Input type="date" value={form.date_given} onChange={(e) => setForm({ ...form, date_given: e.target.value })} />
                </div>
                <div className="space-y-2"><Label>Next Due Date</Label>
                  <Input type="date" value={form.next_due} onChange={(e) => setForm({ ...form, next_due: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2"><Label>Vet</Label>
                <Input value={form.vet} onChange={(e) => setForm({ ...form, vet: e.target.value })} placeholder="Attending veterinarian" />
              </div>
              <div className="space-y-2"><Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by pet or vaccine..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Vaccine</TableHead>
                  <TableHead>Date Given</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Vet</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Print</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{petName(v.pet_id)}</TableCell>
                    <TableCell>{v.vaccine_type}</TableCell>
                    <TableCell>{v.date_given ? formatDate(v.date_given) : "—"}</TableCell>
                    <TableCell>
                      {v.next_due ? (
                        <Badge variant={new Date(v.next_due) <= new Date() ? "destructive" : "secondary"}>
                          {formatDate(v.next_due)}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{v.vet ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{v.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handlePrintCertificate(v)}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No vaccination records</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
