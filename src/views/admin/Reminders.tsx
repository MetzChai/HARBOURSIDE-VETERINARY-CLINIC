"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Send, Loader2 } from "lucide-react";
import { mockVaccinations, mockAppointments, getOwnerById, mockPets } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

interface EmailPreview {
  to: string;
  toName: string;
  subject: string;
  body: string;
}

export default function Reminders() {
  const vaccineDue = mockVaccinations.filter(v => new Date(v.nextDue) <= new Date("2026-04-01"));
  const upcomingAppts = mockAppointments.filter(a => a.status === "Scheduled");

  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string | null>(null);

  const buildVaccineEmail = (v: typeof mockVaccinations[number]): EmailPreview | null => {
    const pet = mockPets.find(p => p.id === v.petId);
    const owner = pet ? getOwnerById(pet.ownerId) : null;
    if (!owner) return null;
    return {
      to: owner.email,
      toName: owner.name,
      subject: `Vaccination Reminder for ${v.petName} — ${v.vaccineType}`,
      body: `Hi ${owner.name},

This is a friendly reminder from Harbourside Veterinary Clinic that ${v.petName}'s ${v.vaccineType} vaccination is due on ${v.nextDue}.

Please book an appointment at your earliest convenience to keep ${v.petName} healthy and protected.

Reply to this email or call us to schedule.

Warm regards,
Harbourside Veterinary Clinic`,
    };
  };

  const buildApptEmail = (a: typeof mockAppointments[number]): EmailPreview | null => {
    const pet = mockPets.find(p => p.id === a.petId);
    const owner = pet ? getOwnerById(pet.ownerId) : null;
    if (!owner) return null;
    return {
      to: owner.email,
      toName: owner.name,
      subject: `Appointment Reminder for ${a.petName} on ${a.date}`,
      body: `Hi ${owner.name},

This is a reminder of ${a.petName}'s upcoming appointment at Harbourside Veterinary Clinic.

📅 Date: ${a.date}
🕐 Time: ${a.time}
👨‍⚕️ Veterinarian: ${a.vet}
📋 Reason: ${a.reason}

Please arrive 10 minutes early. If you need to reschedule, contact us as soon as possible.

See you soon,
Harbourside Veterinary Clinic`,
    };
  };

  const openPreview = (id: string, email: EmailPreview | null) => {
    if (!email) {
      toast({ title: "Owner not found", description: "Cannot build email.", variant: "destructive" });
      return;
    }
    setCurrentId(id);
    setPreview(email);
  };

  const handleSend = async () => {
    if (!preview || !currentId) return;
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 900));
    setSentIds(prev => new Set(prev).add(currentId));
    setSending(false);
    setPreview(null);
    toast({
      title: "Reminder sent",
      description: `Email delivered to ${preview.to}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold">Send Reminders</h1>
        <p className="text-muted-foreground text-sm">Notify owners about vaccines and appointments via email</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Vaccination Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Send</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccineDue.map(v => {
                const pet = mockPets.find(p => p.id === v.petId);
                const owner = pet ? getOwnerById(pet.ownerId) : null;
                const id = `vac-${v.id}`;
                const sent = sentIds.has(id);
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.petName}</TableCell>
                    <TableCell>{owner?.name || "—"}</TableCell>
                    <TableCell>{v.vaccineType}</TableCell>
                    <TableCell><Badge variant="secondary">{v.nextDue}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={sent ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => openPreview(id, buildVaccineEmail(v))}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {sent ? "Sent ✓" : "Email"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Appointment Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Send</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAppts.map(a => {
                const id = `appt-${a.id}`;
                const sent = sentIds.has(id);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.petName}</TableCell>
                    <TableCell>{a.ownerName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={sent ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => openPreview(id, buildApptEmail(a))}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {sent ? "Sent ✓" : "Email"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Email Preview</DialogTitle>
            <DialogDescription>Review the reminder before sending.</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[80px_1fr] gap-2 border-b pb-3">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{preview.toName} &lt;{preview.to}&gt;</span>
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{preview.subject}</span>
              </div>
              <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-relaxed max-h-72 overflow-y-auto">
                {preview.body}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

