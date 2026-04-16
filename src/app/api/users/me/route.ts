import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { AgeGroup } from "@prisma/client";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    displayName?: string | null;
    prefecture?: string | null;
    ageGroup?: AgeGroup | null;
    bio?: string | null;
    yearsExp?: number | null;
  };

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: body,
  });

  return NextResponse.json({ ok: true, user: updated });
}
