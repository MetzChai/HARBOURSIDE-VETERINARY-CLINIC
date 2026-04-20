import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Pencil, Plus, Printer, Search, Users } from "lucide-react";
import { mockOwners, getPetsByOwner } from "@/lib/mock-data";
import type { Owner } from "@/lib/mock-data";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";

export default function ManageOwners() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [viewOwner, setViewOwner] = useState<Owner | null>(null);
  const [ownerImages, setOwnerImages] = useState<Record<string, string>>({});
  const [owners, setOwners] = useState<Owner[]>(mockOwners);
  const [showAdd, setShowAdd] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: "", contact: "", email: "", address: "", imageUrl: "" });

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddOwner = () => {
    if (!newOwner.name.trim() || !newOwner.email.trim()) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    const id = `o${Date.now()}`;
    const owner: Owner = {
      id,
      name: newOwner.name.trim(),
      contact: newOwner.contact.trim(),
      email: newOwner.email.trim(),
      address: newOwner.address.trim(),
      imageUrl: newOwner.imageUrl || undefined,
    };
    setOwners(prev => [owner, ...prev]);
    if (newOwner.imageUrl) setOwnerImages(prev => ({ ...prev, [id]: newOwner.imageUrl }));
    setNewOwner({ name: "", contact: "", email: "", address: "", imageUrl: "" });
    setShowAdd(false);
    toast({ title: "Owner added", description: `${owner.name} has been registered.` });
  };

  const getOwnerImage = (owner: Owner) => ownerImages[owner.id] || owner.imageUrl;

  const handlePrint = (owner: Owner) => {
    const pets = getPetsByOwner(owner.id);
    const ownerImg = getOwnerImage(owner);
    const initials = owner.name.split(" ").map(n => n[0]).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Owner Info - ${owner.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#0d9488}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}
      .header{border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:20px}
      .profile{display:flex;align-items:flex-start;gap:20px;margin-bottom:16px}
      .profile img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #0d9488}
      .profile .initials{width:100px;height:100px;border-radius:50%;background:#f0fdfa;color:#0d9488;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;border:3px solid #0d9488}</style></head>
      <body><div class="header"><h1>🩺 Harbourside Veterinary Clinic</h1><p>Owner Information Report</p></div>
      <div class="profile">
        ${ownerImg ? `<img src="${ownerImg}" alt="${owner.name}" />` : `<div class="initials">${initials}</div>`}
        <div>
          <h2 style="margin:0 0 8px">${owner.name}</h2>
          <p><strong>Contact:</strong> ${owner.contact} | <strong>Email:</strong> ${owner.email}</p>
          <p><strong>Address:</strong> ${owner.address}</p>
        </div>
      </div>
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
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getOwnerImage(owner)} alt={owner.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {owner.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{owner.name}</span>
                    </div>
                  </TableCell>
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
              <div className="flex items-start gap-4">
                <ImageUpload
                  currentImage={getOwnerImage(viewOwner)}
                  fallback={viewOwner.name.split(" ").map(n => n[0]).join("")}
                  folder="owners"
                  size="lg"
                  onImageUploaded={(url) => setOwnerImages(prev => ({ ...prev, [viewOwner.id]: url }))}
                />
                <div className="space-y-2 text-sm flex-1">
                  <p><span className="text-muted-foreground">Contact:</span> {viewOwner.contact}</p>
                  <p><span className="text-muted-foreground">Email:</span> {viewOwner.email}</p>
                  <p><span className="text-muted-foreground">Address:</span> {viewOwner.address}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-heading font-semibold mb-2">Registered Pets</h4>
                <div className="space-y-2">
                  {getPetsByOwner(viewOwner.id).map(pet => (
                    <div key={pet.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {pet.name[0]}
                        </AvatarFallback>
                      </Avatar>
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
