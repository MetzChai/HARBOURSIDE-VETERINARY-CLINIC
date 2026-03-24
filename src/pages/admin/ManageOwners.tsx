import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Pencil, Printer, Search, Users } from "lucide-react";
import { mockOwners, getPetsByOwner } from "@/lib/mock-data";
import type { Owner } from "@/lib/mock-data";

export default function ManageOwners() {
  const [search, setSearch] = useState("");
  const [viewOwner, setViewOwner] = useState<Owner | null>(null);

  const filtered = mockOwners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrint = (owner: Owner) => {
    const pets = getPetsByOwner(owner.id);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Owner Info - ${owner.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#0d9488}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}
      .header{border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:20px}</style></head>
      <body><div class="header"><h1>🩺 Harbourside Veterinary Clinic</h1><p>Owner Information Report</p></div>
      <h2>${owner.name}</h2>
      <p><strong>Contact:</strong> ${owner.contact} | <strong>Email:</strong> ${owner.email}</p>
      <p><strong>Address:</strong> ${owner.address}</p>
      <h3>Registered Pets</h3>
      <table><tr><th>Pet Name</th><th>Species</th><th>Breed</th><th>Gender</th></tr>
      ${pets.map(p => `<tr><td>${p.name}</td><td>${p.species}</td><td>${p.breed}</td><td>${p.gender}</td></tr>`).join("")}
      </table><br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold">Manage Owners</h1>
        <p className="text-muted-foreground text-sm">{mockOwners.length} owners registered</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search owners..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(owner => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>{owner.contact}</TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{owner.address}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewOwner(owner)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(owner)}><Printer className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewOwner} onOpenChange={() => setViewOwner(null)}>
        <DialogContent>
          {viewOwner && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> {viewOwner.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Contact:</span> {viewOwner.contact}</p>
                <p><span className="text-muted-foreground">Email:</span> {viewOwner.email}</p>
                <p><span className="text-muted-foreground">Address:</span> {viewOwner.address}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-heading font-semibold mb-2">Registered Pets</h4>
                <div className="space-y-2">
                  {getPetsByOwner(viewOwner.id).map(pet => (
                    <div key={pet.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{pet.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">{pet.species} · {pet.breed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => handlePrint(viewOwner)}>
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
