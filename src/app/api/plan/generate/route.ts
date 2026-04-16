import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateWeeklyPlan } from "@/lib/claude";
import { getWeekStart } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    age: number;
    maskedMemo: string;
    nextWeekMemo?: string;
  };

  const { age, maskedMemo, nextWeekMemo } = body;

  if (!maskedMemo?.trim() || maskedMemo.length < 10) {
    return NextResponse.json({ error: "メモを10文字以上入力してください" }, { status: 400 });
  }

  const plan = await generateWeeklyPlan({ age, maskedMemo, nextWeekMemo });

  const weeklyPlan = await db.weeklyPlan.create({
    data: {
      userId: session.user.id,
      weekStartDate: getWeekStart(),
      targetAge: age,
      rawMemo: maskedMemo,
      goal: plan.goal,
      content: plan.content,
      environment: plan.environment,
      support: plan.support,
      guidelineRef: plan.guidelineRef,
    },
  });

  return NextResponse.json({ id: weeklyPlan.id, ...plan });
}
