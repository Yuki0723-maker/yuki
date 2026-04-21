import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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
    db.user.findUnique({ where: { id: userId }, select: { name: true, targetAge: true } }),
  ]);

  // クラス情報未登録なら初回設定へ
  if (user?.targetAge === null || user?.targetAge === undefined) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#3d2b1f]">
            こんにちは、{user?.name ?? "保育士さん"}
          </h1>
          <p className="text-sm text-[#b09070] mt-1">
            {memoCount > 0 ? `今週のLINEメモ ${memoCount}件` : "今日も素敵な保育を"}
          </p>
        </div>
        <Link
          href="/plan/new"
          className="bg-[#3d2b1f] text-[#f5f0e8] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#5c3d2e] transition-colors"
          style={{ minHeight: "44px", display: "flex", alignItems: "center" }}
        >
          週案を作る
        </Link>
      </div>

      {/* Plans list */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[#ddd0b8] p-16 text-center">
          <div className="flex justify-center mb-5">
            <EmptyIllustration />
          </div>
          <p className="text-[#3d2b1f] font-semibold mb-2">週案はまだありません</p>
          <p className="text-sm text-[#b09070] mb-6">
            子どもたちの様子を入力するだけで、AIが指導計画を自動作成します。
          </p>
          <Link
            href="/plan/new"
            className="inline-flex items-center gap-2 bg-[#3d2b1f] text-[#f5f0e8] font-semibold px-7 py-3 rounded-xl hover:bg-[#5c3d2e] transition-colors text-sm"
          >
            最初の週案を作る
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plan/${plan.id}`}
              className="block bg-white rounded-2xl border border-[#ece4d4] p-5 hover:border-[#d4845a] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#f5f0e8] text-[#a85c38] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {AGE_LABELS[plan.targetAge]}
                    </span>
                    {plan.isPublic && (
                      <span className="bg-[#faf8f3] text-[#b09070] text-xs px-2.5 py-0.5 rounded-full border border-[#ddd0b8]">
                        公開中
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[#3d2b1f] text-sm">
                    {formatWeekRange(plan.weekStartDate)}
                  </p>
                  <p className="text-xs text-[#b09070] mt-0.5 line-clamp-1">{plan.goal}</p>
                </div>
                <span className="text-[#ddd0b8] text-xl">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* notebook */}
      <rect x="15" y="10" width="55" height="68" rx="4" stroke="#ddd0b8" strokeWidth="2" fill="#faf8f3"/>
      <rect x="15" y="10" width="10" height="68" rx="4" stroke="#ddd0b8" strokeWidth="2" fill="#ece4d4"/>
      <line x1="32" y1="30" x2="60" y2="30" stroke="#ddd0b8" strokeWidth="1.5"/>
      <line x1="32" y1="40" x2="60" y2="40" stroke="#ddd0b8" strokeWidth="1.5"/>
      <line x1="32" y1="50" x2="50" y2="50" stroke="#ddd0b8" strokeWidth="1.5"/>
      {/* pen */}
      <path d="M62 55 L78 35 L82 39 L66 59 Z" stroke="#d4845a" strokeWidth="1.5" fill="#f5f0e8"/>
      <path d="M62 55 L60 62 L67 60 Z" fill="#d4845a"/>
      <line x1="75" y1="37" x2="79" y2="41" stroke="#d4845a" strokeWidth="1.5"/>
    </svg>
  );
}
