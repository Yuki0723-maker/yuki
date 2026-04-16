import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatWeekRange, getWeekStart, AGE_GROUP_LABELS } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";

export const metadata: Metadata = { title: "ダッシュボード" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [recentPlans, totalNotes, user] = await Promise.all([
    db.plan.findMany({
      where: { userId },
      include: { weeklyNote: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.weeklyNote.count({ where: { userId } }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  const thisWeek = getWeekStart();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          こんにちは、{user?.displayName ?? user?.name ?? "保育士さん"} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          今週（{formatWeekRange(thisWeek)}）の記録を始めましょう
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "週案の数", value: totalNotes, unit: "件", icon: "📋" },
          { label: "今月の作成", value: recentPlans.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length, unit: "件", icon: "📅" },
          { label: "公開中", value: recentPlans.filter(p => p.visibility === "PUBLIC").length, unit: "件", icon: "🌐" },
        ].map(({ label, value, unit, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-3xl font-bold text-gray-800">
              {value}
              <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick action */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-1">今週の様子を記録しよう</h2>
        <p className="text-green-100 text-sm mb-4">
          子どもたちの様子を書くだけで、AIが指導計画を自動作成します。
        </p>
        <Link
          href="/notes/new"
          className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-green-50 transition-colors"
        >
          ✍️ 週の様子を入力する
        </Link>
      </div>

      {/* Recent plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">最近の週案</h2>
          <Link href="/notes" className="text-sm text-green-600 hover:underline">すべて見る</Link>
        </div>

        {recentPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-400 text-sm">まだ週案がありません</p>
            <Link href="/notes/new" className="mt-4 inline-block text-sm text-green-600 font-medium hover:underline">
              最初の週案を作成する →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/notes/${plan.weeklyNoteId}`}
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {plan.weeklyNote.ageGroup && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {AGE_GROUP_LABELS[plan.weeklyNote.ageGroup as AgeGroup]}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        plan.visibility === "PUBLIC"
                          ? "bg-blue-100 text-blue-700"
                          : plan.visibility === "MEMBERS_ONLY"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {plan.visibility === "PUBLIC" ? "公開" : plan.visibility === "MEMBERS_ONLY" ? "会員限定" : "非公開"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {formatWeekRange(plan.weeklyNote.weekStart)}の週案
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {plan.aims.split("\n")[0]}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
