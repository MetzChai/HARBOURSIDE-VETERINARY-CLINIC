import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";

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

Keep responses concise and friendly. Use emoji sparingly. If unsure, suggest they call the clinic.`;

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI chat is not configured. Set LOVABLE_API_KEY in your environment." },
      { status: 503 }
    );
  }

  try {
    const { messages } = await request.json();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limited, please try again shortly." }, { status: 429 });
      }
      return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
    }

    return new Response(response.body, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
