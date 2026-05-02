import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateXPosts } from "@/lib/x-claude";
import type { XPostTone } from "@/lib/x-claude";

export async function POST(req: Request) {
  const body = await req.json() as { ideaId?: string; tone?: XPostTone };
  const { ideaId, tone } = body;

  if (!ideaId || !tone) {
    return NextResponse.json({ error: "ideaId と tone は必須です" }, { status: 400 });
  }

  const idea = await db.xPostIdea.findUnique({ where: { id: ideaId } });
  if (!idea) {
    return NextResponse.json({ error: "アイデアが見つかりません" }, { status: 404 });
  }

  const posts = await generateXPosts({
    title: idea.title,
    memo: idea.memo,
    tags: idea.tags,
    tone,
  });

  const created = await db.$transaction(
    posts.map((p) =>
      db.xGeneratedPost.create({
        data: { ideaId, content: p.text, tone },
      })
    )
  );

  await db.xPostIdea.update({
    where: { id: ideaId },
    data: { status: "GENERATED" },
  });

  return NextResponse.json(created, { status: 201 });
}
