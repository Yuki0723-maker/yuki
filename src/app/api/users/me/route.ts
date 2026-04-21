import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    name?: string;
    targetAge?: number | null;
    bio?: string | null;
    classSize?: number | null;
    teachingStyle?: string | null;
    childrenNote?: string | null;
  };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: body.name,
      targetAge: body.targetAge,
      bio: body.bio,
      classSize: body.classSize,
      teachingStyle: body.teachingStyle,
      childrenNote: body.childrenNote,
    },
  });

  return NextResponse.json({ ok: true });
}
