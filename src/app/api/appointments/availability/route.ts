import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getAppointmentAvailability } from "@/lib/server/data";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Valid date is required (YYYY-MM-DD)." }, { status: 400 });
  }

  try {
    const availability = await getAppointmentAvailability(date);
    return NextResponse.json(availability);
  } catch (e) {
    console.error("availability error:", e);
    return NextResponse.json({ error: "Failed to load availability" }, { status: 500 });
  }
}
