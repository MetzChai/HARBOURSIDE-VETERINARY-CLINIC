import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserProfile, updateUserProfile } from "@/lib/server/data";

function profileFromSession(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  return {
    id: session.id,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    authMethod: "password" as const,
    createdAt: new Date().toISOString(),
    contact: null,
    address: null,
    ownerName: session.fullName,
    avatarUrl: null,
    emailVerified: true,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(session.id);
    if (profile) {
      return NextResponse.json({ profile });
    }
    return NextResponse.json({ profile: profileFromSession(session) });
  } catch (e) {
    console.error("profile GET error:", e);
    return NextResponse.json({ profile: profileFromSession(session) });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const profile = await updateUserProfile(session.id, {
      fullName: body.fullName,
      contact: body.contact,
      address: body.address,
      avatarUrl: body.avatarUrl,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return NextResponse.json({ profile: profile ?? profileFromSession(session) });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
