import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Printer, AlertTriangle, Trash2 } from "lucide-react";
import { mockInventory, type InventoryItem } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

const computeStatus = (quantity: number, expirationDate: string): InventoryItem["status"] => {
  if (expirationDate && new Date(expirationDate) < new Date()) return "Expired";
  if (quantity <= 5) return "Low Stock";
  return "Available";
};

type FormState = { vaccineName: string; quantity: string; expirationDate: string };
const emptyForm: FormState = { vaccineName: "", quantity: "", expirationDate: "" };

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setForm({
      vaccineName: item.vaccineName,
      quantity: String(item.quantity),
      expirationDate: item.expirationDate,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.vaccineName.trim() || !form.quantity || !form.expirationDate) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const quantity = Math.max(0, parseInt(form.quantity, 10) || 0);
    const status = computeStatus(quantity, form.expirationDate);

    if (editingId) {
      setItems(prev =>
        prev.map(i =>
          i.id === editingId
            ? { ...i, vaccineName: form.vaccineName.trim(), quantity, expirationDate: form.expirationDate, status }
            : i
        )
      );
      toast({ title: "Item updated", description: `${form.vaccineName} has been updated.` });
    } else {
      const newItem: InventoryItem = {
        id: `i${Date.now()}`,
        vaccineName: form.vaccineName.trim(),
        quantity,
        expirationDate: form.expirationDate,
        status,
      };
      setItems(prev => [...prev, newItem]);
      toast({ title: "Item added", description: `${newItem.vaccineName} added to inventory.` });
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const item = items.find(i => i.id === deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    if (item) toast({ title: "Item deleted", description: `${item.vaccineName} removed from inventory.` });
    setDeleteId(null);
  };

  const handlePrint = (type: "all" | "expired") => {
    const list = type === "expired" ? items.filter(i => i.status === "Expired") : items;
    const title = type === "expired" ? "Expired Items Report" : "Inventory Report";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#0d9488}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}
      .low{color:#f59e0b}.expired{color:#ef4444}</style></head>
      <body><h1>🩺 Harbourside Veterinary Clinic</h1><h2>${title}</h2>
      <table><tr><th>Vaccine</th><th>Quantity</th><th>Expiration</th><th>Status</th></tr>
      ${list.map(i => `<tr><td>${i.vaccineName}</td><td>${i.quantity}</td><td>${i.expirationDate}</td>
      <td class="${i.status === "Expired" ? "expired" : i.status === "Low Stock" ? "low" : ""}">${i.status}</td></tr>`).join("")}
      </table><br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p></body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Vaccine Inventory</h1>
          <p className="text-muted-foreground text-sm">Track vaccine stock and expiration</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handlePrint("all")}><Printer className="h-4 w-4 mr-1" /> Print Report</Button>
          <Button variant="outline" onClick={() => handlePrint("expired")}><AlertTriangle className="h-4 w-4 mr-1" /> Print Expired</Button>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Vaccine Name</Label>
              <Input
                placeholder="e.g. Rabies"
                value={form.vaccineName}
                onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={form.expirationDate}
                  onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item from the inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alerts */}
      {items.filter(i => i.status !== "Available").length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              {items.filter(i => i.status !== "Available").map(i => (
                <p key={i.id} className="text-sm">
                  <strong>{i.vaccineName}</strong>: {i.status === "Expired" ? "EXPIRED" : `LOW STOCK (${i.quantity} remaining)`}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccine Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.vaccineName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.expirationDate}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Available" ? "default" : item.status === "Low Stock" ? "secondary" : "destructive"}>
                      {item.status === "Low Stock" && "⚠️ "}{item.status === "Expired" && "❌ "}{item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
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
