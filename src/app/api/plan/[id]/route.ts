import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await db.weeklyPlan.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    goal?: string;
    content?: string;
    environment?: string;
    support?: string;
    guidelineRef?: string;
    isPublic?: boolean;
    templateId?: string | null;
  };

  const plan = await db.weeklyPlan.updateMany({
    where: { id, userId: session.user.id },
    data: body,
  });

  if (plan.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.weeklyPlan.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
