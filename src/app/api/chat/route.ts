import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";

const SYSTEM_PROMPT = `You are PawBot, the friendly AI assistant for Harbourside Veterinary Clinic.

You help pet owners with:
- Pet care FAQs (nutrition, grooming, exercise, common illnesses)
- Checking appointment schedules
- Vaccine due dates
- General clinic information

Clinic info:
- Name: Harbourside Veterinary Clinic
- Hours: Mon-Sat 8AM-6PM, Sun closed
- Vets: Dr. Rivera (general), Dr. Tan (surgery & dental)
- Emergency hotline: 0917-VET-HELP

Keep responses concise and friendly. Use emoji sparingly. If unsure, suggest they call the clinic.`;

type ChatMessage = { role: string; content: string };

function toGeminiContents(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI chat is not configured. Set GEMINI_API_KEY in your environment." },
      { status: 503 }
    );
  }

  try {
    const { messages } = await request.json();
    const contents = toGeminiContents(messages ?? []);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Gemini error:", response.status, errText);
      if (response.status === 429) {
        return NextResponse.json({ error: "Rate limited, please try again shortly." }, { status: 429 });
      }
      return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
    }

    if (!response.body) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;
                  controller.enqueue(encoder.encode(sse));
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("stream error:", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
