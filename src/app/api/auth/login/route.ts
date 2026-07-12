import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth";
import { loginUser, ensureUserProfile } from "@/lib/server/data";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await loginUser(email, password);
    if (!result) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if ("error" in result && result.error === "EMAIL_NOT_VERIFIED") {
      return NextResponse.json(
        {
          error: "Please verify your Gmail address with Google before signing in.",
          code: "EMAIL_NOT_VERIFIED",
          email: result.email,
        },
        { status: 403 }
      );
    }

    if ("error" in result && result.error === "GOOGLE_ONLY") {
      return NextResponse.json(
        {
          error: "This account uses Google sign-in. Click Continue with Google below.",
          code: "GOOGLE_ONLY",
          email: result.email,
        },
        { status: 403 }
      );
    }

    if ("error" in result) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = result;
    await ensureUserProfile(user.id, user.email, user.fullName);

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
