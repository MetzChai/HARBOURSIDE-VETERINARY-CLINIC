import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "pets";

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(process.cwd(), "public", "uploads", fileName), buffer);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error("upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
