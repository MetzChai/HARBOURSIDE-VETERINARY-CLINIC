import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Printer, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate } from "@/hooks/useRows";
import { formatDate } from "@/lib/age";
import { toast } from "sonner";

const STATUSES = ["Scheduled", "Completed", "Missed", "Cancelled", "Requested"] as const;
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

const statusVariant = (s: string) =>
  s === "Completed" ? "default" : s === "Missed" || s === "Cancelled" ? "destructive" : "secondary";

export default function Schedule() {
  const { data: appointments = [], isLoading } = useRows<any>("appointments", { orderBy: "date", ascending: false });
  const { data: pets = [] } = useRows<any>("pets", { orderBy: "name" });
  const invalidate = useInvalidate();

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyForm = { pet_id: "", date: "", time: "", vet: "", reason: "", type: "scheduled" };
  const [form, setForm] = useState(emptyForm);

  const petName = (id: string) => pets.find((p) => p.id === id)?.name ?? "—";
  const petOwner = (id: string) => pets.find((p) => p.id === id)?.owner_id ?? null;

  // Slots taken for the date currently selected in the form
  const takenSlots = useMemo(() => {
    if (!form.date) return new Set<string>();
    return new Set(
      appointments
        .filter((a) => a.date === form.date && a.status !== "Cancelled")
        .map((a) => a.time)
    );
  }, [appointments, form.date]);

  const availableSlots = SLOTS.filter((s) => !takenSlots.has(s));

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked as ${status}`);
    invalidate("appointments");
  };

  const handleSchedule = async () => {
    if (!form.pet_id || !form.date || !form.time || !form.vet) {
      toast.error("Please fill in pet, date, time and vet"); return;
    }
    if (takenSlots.has(form.time)) { toast.error("That time slot is already booked"); return; }
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      pet_id: form.pet_id,
      owner_id: petOwner(form.pet_id),
      date: form.date,
      time: form.time,
      vet: form.vet,
      reason: form.reason.trim() || null,
      type: form.type,
      status: "Scheduled",
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${petName(form.pet_id)} booked on ${form.date} at ${form.time}`);
    setForm(emptyForm);
    setShowAdd(false);
    invalidate("appointments");
  };

  const handlePrint = () => {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`
      <html><head><title>Appointment Schedule</title>
      <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#c0392b}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#fdecea;color:#c0392b}</style></head>
      <body><h1>Harbourside Veterinary Clinic</h1><h2>Appointment Schedule</h2>
      <table><tr><th>Pet</th><th>Date</th><th>Time</th><th>Vet</th><th>Reason</th><th>Type</th><th>Status</th></tr>
      ${appointments.map((a) => `<tr><td>${petName(a.pet_id)}</td><td>${a.date}</td><td>${a.time}</td><td>${a.vet ?? "—"}</td><td>${a.reason ?? "—"}</td><td>${a.type}</td><td>${a.status}</td></tr>`).join("")}
      </table><br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground text-sm">Book appointments with live time-slot availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print Schedule</Button>
          <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) setForm(emptyForm); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Book Appointment</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-heading">Book Appointment</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Pet</Label>
                  <Select value={form.pet_id} onValueChange={(v) => setForm((f) => ({ ...f, pet_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                    <SelectContent>{pets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: "" }))} />
                  </div>
                  <div className="space-y-2"><Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="walk_in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Clock className="h-4 w-4" /> Available Time Slots</Label>
                  {!form.date ? (
                    <p className="text-xs text-muted-foreground">Select a date to see open slots.</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-xs text-destructive">No slots available on this date.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {SLOTS.map((s) => {
                        const taken = takenSlots.has(s);
                        const selected = form.time === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={taken}
                            onClick={() => setForm((f) => ({ ...f, time: s }))}
                            className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                              taken ? "bg-muted text-muted-foreground line-through cursor-not-allowed"
                              : selected ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-accent border-border"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {form.date && <p className="text-xs text-muted-foreground">{availableSlots.length} of {SLOTS.length} slots open</p>}
                </div>

                <div className="space-y-2"><Label>Veterinarian</Label>
                  <Select value={form.vet} onValueChange={(v) => setForm((f) => ({ ...f, vet: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select vet" /></SelectTrigger>
                    <SelectContent><SelectItem value="Dr. Rivera">Dr. Rivera</SelectItem><SelectItem value="Dr. Tan">Dr. Tan</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Reason</Label>
                  <Input placeholder="e.g. Annual check-up" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAdd(false); setForm(emptyForm); }}>Cancel</Button>
                <Button onClick={handleSchedule} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Pet</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead>
                <TableHead>Vet</TableHead><TableHead>Type</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{petName(a.pet_id)}</TableCell>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.vet ?? "—"}</TableCell>
                    <TableCell className="capitalize">{String(a.type).replace("_", "-")}</TableCell>
                    <TableCell>{a.reason ?? "—"}</TableCell>
                    <TableCell>
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                        <SelectTrigger className="h-8 w-[140px] border-0 bg-transparent p-0 hover:bg-accent/50 focus:ring-1">
                          <Badge variant={statusVariant(a.status)} className="cursor-pointer">{a.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {appointments.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No appointments yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
