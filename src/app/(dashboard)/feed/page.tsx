import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatWeekRange, AGE_GROUP_LABELS } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";

export const metadata: Metadata = { title: "フィード" };

export default async function FeedPage() {
  const plans = await db.plan.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      weeklyNote: { select: { weekStart: true, ageGroup: true, theme: true } },
      user: { select: { displayName: true, name: true, image: true, prefecture: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">コミュニティフィード</h1>
        <p className="text-gray-500 mt-1 text-sm">
          全国の保育士が共有した週案（子ども・園名は非公開）
        </p>
      </div>

      {/* Coming soon notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex items-start gap-3">
        <span className="text-2xl">🚀</span>
        <div>
          <p className="font-semibold text-blue-800 text-sm">Phase 2 機能 — 近日公開予定</p>
          <p className="text-blue-600 text-xs mt-1">
            リアルタイムフィード・いいね・活動アイデア投稿・年齢別掲示板を実装中です。
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-400 text-sm">まだ公開されている週案がありません</p>
          <p className="text-gray-400 text-xs mt-1">
            週案を作成し、公開設定にすると全国の保育士と共有できます
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const authorName = plan.user.displayName ?? plan.user.name ?? "保育士さん";
            const firstLine = plan.aims.split("\n")[0];
            return (
              <div key={plan.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                      {authorName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{authorName}</p>
                      {plan.user.prefecture && (
                        <p className="text-xs text-gray-400">{plan.user.prefecture}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {plan.weeklyNote.ageGroup && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {AGE_GROUP_LABELS[plan.weeklyNote.ageGroup as AgeGroup]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {formatWeekRange(plan.weeklyNote.weekStart)}の週案
                </p>
                <div className="bg-green-50 rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">🎯 ねらい</p>
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{firstLine}</p>
                </div>

                {plan.weeklyNote.theme.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {plan.weeklyNote.theme.slice(0, 4).map((t) => (
                      <span key={t} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
