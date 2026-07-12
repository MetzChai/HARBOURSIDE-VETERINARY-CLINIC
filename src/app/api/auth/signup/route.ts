import { NextResponse } from "next/server";
import { registerUser } from "@/lib/server/data";
import { getPool } from "@/lib/server/db";
import { isGmailAddress } from "@/lib/server/google";

function signupErrorMessage(error: unknown): { message: string; status: number } {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes("DATABASE_URL is not set")) {
    return {
      message: "Server database is not configured. Set DATABASE_URL in .env and restart the app.",
      status: 500,
    };
  }

  if (
    msg.includes("must_verify_gmail") ||
    msg.includes("email_verified") ||
    msg.includes("column") ||
    msg.includes("does not exist")
  ) {
    return {
      message: "Database needs updating. Run npm run db:push in the harboursideclinic folder, then try again.",
      status: 500,
    };
  }

  if (msg.includes("duplicate key") || msg.includes("unique constraint") || msg.includes("already exists")) {
    return { message: "An account with this email already exists.", status: 409 };
  }

  if (msg.includes("connect") || msg.includes("ECONNREFUSED") || msg.includes("timeout")) {
    return {
      message: "Could not connect to the database. Check DATABASE_URL and your internet connection.",
      status: 500,
    };
  }

  return { message: "Signup failed. Please try again or use Continue with Google.", status: 500 };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = body.password;
    const fullName = body.fullName;
    const contact = body.contact;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
    }
    if (!isGmailAddress(email)) {
      return NextResponse.json(
        { error: "Pet owner registration requires a @gmail.com address." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const pool = getPool();
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [email]);
    if (existing.rows.length) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const user = await registerUser({ email, password, fullName, contact });

    return NextResponse.json({
      needsVerification: true,
      user: { id: user.id, email: user.email, user_metadata: { full_name: user.fullName } },
      message: "Account created. Verify your Gmail with Google before signing in.",
    });
  } catch (e) {
    console.error("signup error:", e);
    const { message, status } = signupErrorMessage(e);
    return NextResponse.json({ error: message }, { status });
  }
}
