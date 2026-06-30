import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { full_name: user.fullName },
      },
      access_token: "session",
    },
    role: user.role,
  });
}
