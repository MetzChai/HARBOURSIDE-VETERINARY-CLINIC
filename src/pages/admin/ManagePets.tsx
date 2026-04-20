import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Eye, Pencil, Trash2, Printer, Search, PawPrint } from "lucide-react";
import { mockPets, mockOwners, getOwnerById, getVaccinationsByPet, getCheckupsByPet, getTreatmentsByPet } from "@/lib/mock-data";
import type { Pet } from "@/lib/mock-data";
import ImageUpload from "@/components/ImageUpload";

export default function ManagePets() {
  const [search, setSearch] = useState("");
  const [viewPet, setViewPet] = useState<Pet | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [petImages, setPetImages] = useState<Record<string, string>>({});
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [editForm, setEditForm] = useState({ name: "", species: "", breed: "", gender: "Male" as "Male" | "Female", dob: "", ownerId: "", imageUrl: "" });
  const [deletePet, setDeletePet] = useState<Pet | null>(null);

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase()) ||
    getOwnerById(p.ownerId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getPetImage = (pet: Pet) => petImages[pet.id] || pet.imageUrl;

  const openEdit = (pet: Pet) => {
    setEditPet(pet);
    setEditForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      dob: pet.dob,
      ownerId: pet.ownerId,
      imageUrl: petImages[pet.id] || pet.imageUrl || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editPet) return;
    if (!editForm.name.trim() || !editForm.species || !editForm.ownerId) return;
    setPets(prev => prev.map(p => p.id === editPet.id ? {
      ...p,
      name: editForm.name.trim(),
      species: editForm.species,
      breed: editForm.breed.trim(),
      gender: editForm.gender,
      dob: editForm.dob,
      ownerId: editForm.ownerId,
      imageUrl: editForm.imageUrl || undefined,
    } : p));
    if (editForm.imageUrl) setPetImages(prev => ({ ...prev, [editPet.id]: editForm.imageUrl }));
    setEditPet(null);
  };

  const handleDelete = () => {
    if (!deletePet) return;
    setPets(prev => prev.filter(p => p.id !== deletePet.id));
    setDeletePet(null);
  };

  const handlePrint = (pet: Pet) => {
    const owner = getOwnerById(pet.ownerId);
    const vaccinations = getVaccinationsByPet(pet.id);
    const petImg = getPetImage(pet);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Pet Profile - ${pet.name}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a}
      h1{color:#0d9488;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f0fdfa;color:#0d9488}
      .header{border-bottom:2px solid #0d9488;padding-bottom:12px;margin-bottom:20px}
      .profile{display:flex;align-items:flex-start;gap:20px;margin-bottom:16px}
      .profile img{width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #0d9488}
      .profile .initials{width:100px;height:100px;border-radius:50%;background:#f0fdfa;color:#0d9488;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:bold;border:3px solid #0d9488}</style></head>
      <body><div class="header"><h1>🩺 Harbourside Veterinary Clinic</h1><p>Pet Profile Report</p></div>
      <div class="profile">
        ${petImg ? `<img src="${petImg}" alt="${pet.name}" />` : `<div class="initials">${pet.name[0]}</div>`}
        <div>
          <h2 style="margin:0 0 8px">${pet.name}</h2>
          <p><strong>Species:</strong> ${pet.species} | <strong>Breed:</strong> ${pet.breed} |
          <strong>Gender:</strong> ${pet.gender} | <strong>DOB:</strong> ${pet.dob}</p>
          <p><strong>Owner:</strong> ${owner?.name} | <strong>Contact:</strong> ${owner?.contact}</p>
        </div>
      </div>
      <h3>Vaccination Records</h3>
      <table><tr><th>Vaccine</th><th>Date Given</th><th>Next Due</th><th>Notes</th></tr>
      ${vaccinations.map(v => `<tr><td>${v.vaccineType}</td><td>${v.dateGiven}</td><td>${v.nextDue}</td><td>${v.notes}</td></tr>`).join("")}
      </table><br><p style="color:#999;font-size:12px">Generated on ${new Date().toLocaleDateString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Manage Pets</h1>
          <p className="text-muted-foreground text-sm">{pets.length} pets registered</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add Pet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">Add New Pet</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="flex justify-center">
                <ImageUpload
                  fallback="?"
                  folder="pets"
                  size="lg"
                  onImageUploaded={(url) => console.log("New pet image:", url)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Pet Name</Label><Input placeholder="e.g. Max" /></div>
                <div className="space-y-2"><Label>Species</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Dog">Dog</SelectItem><SelectItem value="Cat">Cat</SelectItem><SelectItem value="Bird">Bird</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Breed</Label><Input placeholder="e.g. Golden Retriever" /></div>
                <div className="space-y-2"><Label>Gender</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Owner</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                    <SelectContent>{mockOwners.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button onClick={() => setShowAdd(false)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pets..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(pet => (
                <TableRow key={pet.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getPetImage(pet)} alt={pet.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {pet.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{pet.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{pet.species}</Badge></TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{getOwnerById(pet.ownerId)?.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewPet(pet)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(pet)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletePet(pet)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePrint(pet)}><Printer className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewPet} onOpenChange={() => setViewPet(null)}>
        <DialogContent className="max-w-2xl">
          {viewPet && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading flex items-center gap-2">
                  <PawPrint className="h-5 w-5 text-primary" /> {viewPet.name}'s Profile
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-start gap-4">
                <ImageUpload
                  currentImage={getPetImage(viewPet)}
                  fallback={viewPet.name[0]}
                  folder="pets"
                  size="lg"
                  onImageUploaded={(url) => setPetImages(prev => ({ ...prev, [viewPet.id]: url }))}
                />
                <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                  <div><span className="text-muted-foreground">Species:</span> {viewPet.species}</div>
                  <div><span className="text-muted-foreground">Breed:</span> {viewPet.breed}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {viewPet.gender}</div>
                  <div><span className="text-muted-foreground">DOB:</span> {viewPet.dob}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Owner:</span> {getOwnerById(viewPet.ownerId)?.name}</div>
                </div>
              </div>
              <Tabs defaultValue="vaccines" className="mt-4">
                <TabsList>
                  <TabsTrigger value="vaccines">Vaccines</TabsTrigger>
                  <TabsTrigger value="checkups">Check-ups</TabsTrigger>
                  <TabsTrigger value="treatments">Treatments</TabsTrigger>
                </TabsList>
                <TabsContent value="vaccines">
                  <Table>
                    <TableHeader><TableRow><TableHead>Vaccine</TableHead><TableHead>Date</TableHead><TableHead>Next Due</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {getVaccinationsByPet(viewPet.id).map(v => (
                        <TableRow key={v.id}><TableCell>{v.vaccineType}</TableCell><TableCell>{v.dateGiven}</TableCell><TableCell>{v.nextDue}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="checkups">
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Vet</TableHead><TableHead>Diagnosis</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {getCheckupsByPet(viewPet.id).map(c => (
                        <TableRow key={c.id}><TableCell>{c.date}</TableCell><TableCell>{c.vet}</TableCell><TableCell>{c.diagnosis}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="treatments">
                  <Table>
                    <TableHeader><TableRow><TableHead>Treatment</TableHead><TableHead>Date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {getTreatmentsByPet(viewPet.id).map(t => (
                        <TableRow key={t.id}><TableCell>{t.treatment}</TableCell><TableCell>{t.date}</TableCell><TableCell>{t.notes}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => handlePrint(viewPet)}><Printer className="h-4 w-4 mr-1" /> Print Profile</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
