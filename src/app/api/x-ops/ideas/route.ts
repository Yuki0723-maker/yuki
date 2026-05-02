import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const ideas = await db.xPostIdea.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      generatedPosts: { orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json(ideas);
}

export async function POST(req: Request) {
  const body = await req.json() as { title?: string; memo?: string; tags?: string[] };
  const { title, memo, tags } = body;

  if (!title?.trim() || !memo?.trim()) {
    return NextResponse.json({ error: "タイトルとメモは必須です" }, { status: 400 });
  }

  const idea = await db.xPostIdea.create({
    data: {
      title: title.trim(),
      memo: memo.trim(),
      tags: tags ?? [],
    },
  });

  return NextResponse.json(idea, { status: 201 });
}
