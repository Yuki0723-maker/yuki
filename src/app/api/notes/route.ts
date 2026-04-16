import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePlan } from "@/lib/claude";
import type { AgeGroup } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    content: string;
    ageGroup?: AgeGroup | null;
    season?: string | null;
    themes?: string[];
    weekStart: string;
  };

  const { content, ageGroup, season, themes, weekStart } = body;

  if (!content?.trim() || content.length < 20) {
    return NextResponse.json({ error: "週の様子は20文字以上入力してください" }, { status: 400 });
  }

  // WeeklyNote作成 → Claude API呼び出し → Plan保存
  const weeklyNote = await db.weeklyNote.create({
    data: {
      userId: session.user.id,
      content,
      ageGroup: ageGroup ?? undefined,
      season: season ?? undefined,
      theme: themes ?? [],
      weekStart: new Date(weekStart),
    },
  });

  // Claude APIで指導計画生成
  let planContent;
  try {
    planContent = await generatePlan({
      weeklyContent: content,
      ageGroup,
      season,
      themes,
    });
  } catch (err) {
    // AI生成失敗時はnoteだけ返す
    console.error("Claude API error:", err);
    return NextResponse.json({ id: weeklyNote.id, aiError: true });
  }

  // Plan保存
  await db.plan.create({
    data: {
      userId: session.user.id,
      weeklyNoteId: weeklyNote.id,
      aims: planContent.aims,
      content: planContent.content,
      support: planContent.support,
      environment: planContent.environment,
      visibility: "PRIVATE",
    },
  });

  return NextResponse.json({ id: weeklyNote.id });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await db.weeklyNote.findMany({
    where: { userId: session.user.id },
    include: { plan: true },
    orderBy: { weekStart: "desc" },
  });

  return NextResponse.json(notes);
}
