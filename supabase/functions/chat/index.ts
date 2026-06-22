import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are PawBot 🐾, the friendly AI assistant for Harbourside Veterinary Clinic.

You help pet owners with:
- Pet care FAQs (nutrition, grooming, exercise, common illnesses)
- Checking appointment schedules
- Vaccine due dates and reminders
- General clinic information

Clinic info:
- Name: Harbourside Veterinary Clinic
- Hours: Mon-Sat 8AM-6PM, Sun closed
- Vets: Dr. Rivera (general), Dr. Tan (surgery & dental)
- Emergency hotline: 0917-VET-HELP

Current mock data context (use when asked about specific pets/owners):
- Maria Santos owns Max (Golden Retriever) and Whiskers (Persian Cat)
  - Max: Rabies & DHPP due 2026-09-15. Check-up scheduled March 24 at 9AM with Dr. Rivera.
  - Whiskers: Dental cleaning scheduled March 25 at 11AM with Dr. Tan.
- Juan Dela Cruz owns Buddy (Labrador) — Rabies due 2026-03-25 (due soon!)
- Ana Reyes owns Luna (Siamese Cat) — FVRCP due 2026-12-01
- Carlos Garcia owns Rocky (Bulldog) — Rabies overdue since 2026-01-20

Keep responses concise and friendly. Use emoji sparingly. If unsure, suggest they call the clinic.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
