import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushText } from "@/lib/line";

// Vercel Cron: 毎週木曜 20:00 JST
export async function GET(req: Request) {
  // Vercel Cron認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // 今週メモがあるがまだ週案がないユーザーを取得
  const lineUsers = await db.lineUser.findMany({
    include: {
      user: {
        include: {
          memos: {
            where: { createdAt: { gte: startOfWeek } },
          },
          plans: {
            where: { weekStartDate: { gte: startOfWeek } },
          },
        },
      },
    },
  });

  let notified = 0;
  for (const lu of lineUsers) {
    const memoCount = lu.user.memos.length;
    if (memoCount > 0 && lu.user.plans.length === 0) {
      const appUrl = process.env.NEXTAUTH_URL ?? "https://hoikunote.app";
      await pushText(
        lu.lineUserId,
        `今週のメモが${memoCount}件たまっています。週案を作りますか？\n${appUrl}/plan/new`
      );
      notified++;
    }
  }

  return NextResponse.json({ ok: true, notified });
}
