import { NextResponse } from "next/server";
import { createOAuthState, getGoogleRedirectUri } from "@/lib/server/google";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", request.url));
  }

  try {
    const state = await createOAuthState();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getGoogleRedirectUri(request),
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
      state,
    });

    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  } catch (e) {
    console.error("Google auth start error:", e);
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
  }
}
