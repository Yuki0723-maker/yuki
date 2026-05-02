import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await db.xPostIdea.findUnique({
    where: { id },
    include: {
      generatedPosts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!idea) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(idea);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as {
    title?: string;
    memo?: string;
    tags?: string[];
    status?: "IDEA" | "GENERATED" | "POSTED";
  };

  const idea = await db.xPostIdea.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.memo !== undefined && { memo: body.memo }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.status !== undefined && { status: body.status }),
    },
    include: {
      generatedPosts: { orderBy: { createdAt: "desc" } },
    },
  });

  return NextResponse.json(idea);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.xPostIdea.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
