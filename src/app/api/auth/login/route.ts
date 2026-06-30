import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth";
import { loginUser } from "@/lib/server/data";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.fullName } },
      role: user.role,
    });
  } catch (e) {
    console.error("login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
