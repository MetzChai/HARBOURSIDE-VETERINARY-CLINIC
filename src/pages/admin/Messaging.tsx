import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRows, useInvalidate } from "@/hooks/useRows";
import { toast } from "sonner";

export default function Messaging() {
  const { data: owners = [] } = useRows<any>("owners", { orderBy: "name" });
  const { data: messages = [], isLoading } = useRows<any>("messages", { orderBy: "sent_at", ascending: false });
  const invalidate = useInvalidate();
  const [ownerId, setOwnerId] = useState("");
  const [phone, setPhone] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const ownerName = (id?: string) => owners.find((o) => o.id === id)?.name ?? "—";

  const send = async () => {
    if (!body.trim()) { toast.error("Message body is required"); return; }
    const targetPhone = phone || owners.find((o) => o.id === ownerId)?.contact || "";
    if (!targetPhone) { toast.error("Provide a phone number or select an owner with a contact"); return; }
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      owner_id: ownerId || null,
      phone: targetPhone,
      body: body.trim(),
      status: "simulated",
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Text message simulated to ${targetPhone}`);
    setBody(""); setPhone(""); setOwnerId("");
    invalidate("messages");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-primary" /> Text Messages</h1>
        <p className="text-muted-foreground text-sm">Simulated SMS — messages are logged but not actually sent yet.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-heading font-semibold">Compose</h2>
            <div className="space-y-2">
              <Label>Owner (optional)</Label>
              <Select value={ownerId} onValueChange={(v) => { setOwnerId(v); setPhone(owners.find((o) => o.id === v)?.contact ?? ""); }}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>{owners.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Phone Number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXXX" /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={480} placeholder="Reminder: your pet's vaccination is due..." /></div>
            <Button onClick={send} disabled={sending} className="w-full">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-1" /> Send (Simulated)</>}</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b"><h2 className="font-heading font-semibold">Message Log</h2></div>
            {isLoading ? <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
              <Table>
                <TableHeader><TableRow><TableHead>To</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{ownerName(m.owner_id)}<div className="text-xs text-muted-foreground">{m.phone}</div></TableCell>
                      <TableCell className="max-w-[200px] truncate">{m.body}</TableCell>
                      <TableCell><Badge variant="secondary">{m.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {messages.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No messages yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
