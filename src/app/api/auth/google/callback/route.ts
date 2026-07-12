import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/server/auth";
import { loginOrRegisterGoogleUser } from "@/lib/server/data";
import {
  exchangeGoogleCode,
  getGoogleRedirectUri,
  verifyGoogleIdToken,
  verifyOAuthState,
} from "@/lib/server/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }

  const stateValid = await verifyOAuthState(state);
  if (!stateValid) {
    return NextResponse.redirect(new URL("/login?error=google_state_invalid", request.url));
  }

  try {
    const redirectUri = getGoogleRedirectUri(request);
    const tokens = await exchangeGoogleCode(code, redirectUri);
    const googleUser = await verifyGoogleIdToken(tokens.id_token);

    if (!googleUser.emailVerified) {
      return NextResponse.redirect(new URL("/login?error=google_email_unverified", request.url));
    }

    const result = await loginOrRegisterGoogleUser(googleUser);

    if ("error" in result) {
      return NextResponse.redirect(new URL("/login?error=google_gmail_only", request.url));
    }

    const token = await createSessionToken(result.user);
    await setSessionCookie(token);

    const dest = result.user.role === "admin" ? "/admin" : "/user";
    return NextResponse.redirect(new URL(dest, request.url));
  } catch (e) {
    console.error("Google callback error:", e);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
