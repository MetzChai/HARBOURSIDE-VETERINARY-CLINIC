import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth";
import { queryInsert, querySelect, queryUpdate } from "@/lib/server/data";

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, table } = body;

    if (action === "select") {
      const data = await querySelect({
        user,
        table,
        select: body.select,
        filters: body.filters,
        order: body.order,
        single: body.single,
        maybeSingle: body.maybeSingle,
      });
      return NextResponse.json({ data });
    }

    if (action === "insert") {
      const data = await queryInsert({
        user,
        table,
        data: body.data,
        returning: body.returning,
      });
      if (body.single && Array.isArray(data)) {
        return NextResponse.json({ data: data[0] ?? null });
      }
      return NextResponse.json({ data });
    }

    if (action === "update") {
      const meta = await queryUpdate({
        user,
        table,
        data: body.data,
        filters: body.filters ?? [],
      });
      return NextResponse.json({ data: null, meta });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
