import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Printer, AlertTriangle } from "lucide-react";
import { mockInventory } from "@/lib/mock-data";

export default function Inventory() {
  const [showAdd, setShowAdd] = useState(false);

  const handlePrint = (type: "all" | "expired") => {
    const items = type === "expired" ? mockInventory.filter(i => i.status === "Expired") : mockInventory;
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
      ${items.map(i => `<tr><td>${i.vaccineName}</td><td>${i.quantity}</td><td>${i.expirationDate}</td>
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
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">Add Inventory Item</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2"><Label>Vaccine Name</Label><Input placeholder="e.g. Rabies" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="0" /></div>
                  <div className="space-y-2"><Label>Expiration Date</Label><Input type="date" /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button onClick={() => setShowAdd(false)}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {mockInventory.filter(i => i.status !== "Available").length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              {mockInventory.filter(i => i.status !== "Available").map(i => (
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
              {mockInventory.map(item => (
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
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
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
