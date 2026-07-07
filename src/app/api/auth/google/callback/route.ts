import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth";
import { findOrCreateGoogleUser } from "@/lib/server/data";

function getRedirectUri(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return `${origin}/api/auth/google/callback`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(request),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("Google token error:", await tokenRes.text());
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
    }

    const tokens = await tokenRes.json();
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
    }

    const googleUser = await userRes.json() as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=google_no_email", request.url));
    }

    const user = await findOrCreateGoogleUser({
      googleId: googleUser.id,
      email: googleUser.email,
      fullName: googleUser.name ?? googleUser.email.split("@")[0],
    });

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    const dest = user.role === "admin" ? "/admin" : "/user";
    return NextResponse.redirect(new URL(dest, request.url));
  } catch (e) {
    console.error("Google callback error:", e);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
