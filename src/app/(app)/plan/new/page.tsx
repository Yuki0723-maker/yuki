import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlanForm } from "@/components/plan/PlanForm";

export const metadata: Metadata = { title: "週案を作る" };

export default async function PlanNewPage() {
  const session = await auth();

  const [templates, recentMemos] = await Promise.all([
    db.planTemplate.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    db.dailyMemo.findMany({
      where: {
        userId: session!.user.id,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const memoText = recentMemos.map((m) => m.content).join("\n");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">週案を作る</h1>
        <p className="text-sm text-gray-500 mt-1">
          走り書きOK。体言止め・箇条書きでも大丈夫です。
        </p>
      </div>
      <PlanForm templates={templates} initialMemo={memoText} />
    </div>
  );
}
