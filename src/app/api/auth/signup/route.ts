import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth";
import { registerUser } from "@/lib/server/data";
import { getPool } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, contact } = await request.json();
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const pool = getPool();
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await registerUser({ email, password, fullName, contact });
    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.fullName } },
      session: { user: { id: user.id, email: user.email } },
      role: user.role,
    });
  } catch (e) {
    console.error("signup error:", e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
