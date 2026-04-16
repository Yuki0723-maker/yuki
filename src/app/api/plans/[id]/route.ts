import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Visibility } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    aims?: string;
    content?: string;
    support?: string;
    environment?: string;
    evaluation?: string;
    visibility?: Visibility;
  };

  // 所有者確認
  const plan = await db.plan.findUnique({ where: { id } });
  if (!plan || plan.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.plan.update({
    where: { id },
    data: {
      ...body,
      isEdited: true,
    },
  });

  return NextResponse.json(updated);
}
