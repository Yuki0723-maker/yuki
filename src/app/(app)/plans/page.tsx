import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatWeekRange, AGE_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "ホーム" };

export default async function PlansPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [plans, memoCount, user] = await Promise.all([
    db.weeklyPlan.findMany({
      where: { userId },
      orderBy: { weekStartDate: "desc" },
      take: 20,
    }),
    db.dailyMemo.count({
      where: {
        userId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0) - 6 * 86400000) },
      },
    }),
    db.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            こんにちは、{user?.name ?? "保育士さん"} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {memoCount > 0 && `今週のLINEメモ ${memoCount}件`}
          </p>
        </div>
        <Link
          href="/plan/new"
          className="bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors"
          style={{ minHeight: "48px", display: "flex", alignItems: "center" }}
        >
          ✍️ 今週の週案を作る
        </Link>
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-semibold mb-2">週案はまだありません</p>
          <p className="text-sm text-gray-400 mb-6">
            子どもたちの様子を入力するだけで、AIが指導計画を自動作成します。
          </p>
          <Link
            href="/plan/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-3 rounded-full hover:bg-green-700 transition-colors"
          >
            最初の週案を作る →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plan/${plan.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {AGE_LABELS[plan.targetAge]}
                    </span>
                    {plan.isPublic && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        公開中
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {formatWeekRange(plan.weekStartDate)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{plan.goal}</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
