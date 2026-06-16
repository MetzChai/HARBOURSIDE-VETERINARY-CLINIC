import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Bug, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate } from "@/hooks/useRows";
import { formatDate } from "@/lib/age";
import { toast } from "sonner";

export default function Dewormings() {
  const { data: rows = [], isLoading } = useRows<any>("dewormings", { orderBy: "date_given", ascending: false });
  const { data: pets = [] } = useRows<any>("pets", { orderBy: "name" });
  const invalidate = useInvalidate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ pet_id: "", product: "", date_given: "", next_due: "", vet: "", notes: "" });

  const petName = (id: string) => pets.find((p) => p.id === id)?.name ?? "—";
  const filtered = rows.filter((r) =>
    petName(r.pet_id).toLowerCase().includes(search.toLowerCase()) ||
    (r.product ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!form.pet_id || !form.product.trim()) {
      toast.error("Pet and product are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("dewormings").insert({
      pet_id: form.pet_id,
      product: form.product.trim(),
      date_given: form.date_given || null,
      next_due: form.next_due || null,
      vet: form.vet || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Deworming record added");
    setOpen(false);
    setForm({ pet_id: "", product: "", date_given: "", next_due: "", vet: "", notes: "" });
    invalidate("dewormings");
  };

  const isDue = (d?: string) => d && new Date(d) <= new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Bug className="h-6 w-6 text-primary" /> Deworming</h1>
          <p className="text-muted-foreground text-sm">{rows.length} deworming records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Record</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">New Deworming Record</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Pet</Label>
                <Select value={form.pet_id} onValueChange={(v) => setForm((p) => ({ ...p, pet_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>{pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Product</Label><Input value={form.product} onChange={(e) => setForm((p) => ({ ...p, product: e.target.value }))} placeholder="e.g. Drontal Plus" /></div>
                <div className="space-y-2"><Label>Attending Vet</Label><Input value={form.vet} onChange={(e) => setForm((p) => ({ ...p, vet: e.target.value }))} placeholder="Dr. ..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date Given</Label><Input type="date" value={form.date_given} onChange={(e) => setForm((p) => ({ ...p, date_given: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Next Due</Label><Input type="date" value={form.next_due} onChange={(e) => setForm((p) => ({ ...p, next_due: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by pet or product..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead><TableHead>Product</TableHead><TableHead>Date Given</TableHead>
                  <TableHead>Next Due</TableHead><TableHead>Vet</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{petName(r.pet_id)}</TableCell>
                    <TableCell>{r.product}</TableCell>
                    <TableCell>{formatDate(r.date_given)}</TableCell>
                    <TableCell>{formatDate(r.next_due)}</TableCell>
                    <TableCell>{r.vet ?? "—"}</TableCell>
                    <TableCell>
                      {isDue(r.next_due) ? <Badge variant="destructive">Due</Badge> : <Badge className="bg-success text-success-foreground">Up to date</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No records</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
