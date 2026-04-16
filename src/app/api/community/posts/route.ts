import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    type: string;
    title?: string | null;
    content: string;
    targetAge?: number | null;
    season?: string | null;
    tags?: string[];
  };

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
  }

  const post = await db.communityPost.create({
    data: {
      userId: session.user.id,
      type: body.type ?? "discussion",
      title: body.title ?? null,
      content: body.content,
      targetAge: body.targetAge ?? null,
      season: body.season ?? null,
      tags: body.tags ?? [],
    },
  });

  return NextResponse.json({ id: post.id });
}
