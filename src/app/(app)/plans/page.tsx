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

  const [plans, user] = await Promise.all([
    db.weeklyPlan.findMany({
      where: { userId },
      orderBy: { weekStartDate: "desc" },
      take: 5,
    }),
    db.user.findUnique({ where: { id: userId }, select: { name: true, targetAge: true } }),
  ]);

  if (user?.targetAge === null || user?.targetAge === undefined) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Centered hero area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 pt-16">
        <p className="text-sm text-[#b09070] mb-3">
          こんにちは、{user?.name ?? "保育士さん"}
        </p>
        <h1 className="text-[2.2rem] font-semibold text-[#3d2b1f] mb-10 tracking-tight">
          始めましょうか。
        </h1>

        {/* Input bar */}
        <div className="w-full max-w-2xl">
          <Link
            href="/plan/new"
            className="flex items-center bg-white rounded-full border border-[#ddd0b8] px-5 py-3.5 shadow-sm hover:shadow-md hover:border-[#c4aa8a] transition-all gap-3 group"
          >
            <button
              className="w-7 h-7 rounded-full border border-[#ddd0b8] flex items-center justify-center text-[#b09070] group-hover:border-[#d4845a] group-hover:text-[#d4845a] transition-colors flex-shrink-0 cursor-pointer"
              tabIndex={-1}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="flex-1 text-sm text-[#b09070]">
              今週のクラスの様子を話してみましょう…
            </span>
            <div className="flex items-center gap-2 flex-shrink-0 text-[#c4aa8a]">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <path d="M3 9C3 12.3 5.7 15 9 15C12.3 15 15 12.3 15 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="9" x2="4" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="5" y1="6" x2="5" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8" y1="4" x2="8" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="11" y1="6" x2="11" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="14" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </Link>

          {/* Suggestion chips */}
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            <Link
              href="/plan/new"
              className="flex items-center gap-2 bg-white border border-[#ddd0b8] rounded-full px-4 py-2 text-sm text-[#8a6a50] hover:border-[#d4845a] hover:text-[#3d2b1f] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
              </svg>
              週案を作る
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 bg-white border border-[#ddd0b8] rounded-full px-4 py-2 text-sm text-[#8a6a50] hover:border-[#d4845a] hover:text-[#3d2b1f] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M13 2C13 2 12 9 7 11C4 12 2 14 2 14C2 14 3 8 6 6C9 4 13 2 13 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                <path d="M2 14L6 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              コミュニティを見る
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-white border border-[#ddd0b8] rounded-full px-4 py-2 text-sm text-[#8a6a50] hover:border-[#d4845a] hover:text-[#3d2b1f] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              </svg>
              マイページ
            </Link>
          </div>
        </div>
      </div>

      {/* Recent plans */}
      {plans.length > 0 && (
        <div className="px-6 pb-10 max-w-2xl mx-auto w-full">
          <p className="text-xs text-[#b09070] font-medium mb-2 px-1">最近の週案</p>
          <div className="space-y-0.5">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white border border-transparent hover:border-[#ece4d4] transition-all"
              >
                <span className="text-[#c4aa8a] flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2H10L13 5V14H3V2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                    <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="flex-1 text-sm text-[#6a5040] truncate">
                  {formatWeekRange(plan.weekStartDate)}
                  {plan.goal && (
                    <span className="text-[#b09070] ml-2 text-xs">— {plan.goal}</span>
                  )}
                </span>
                <span className="bg-[#f5f0e8] text-[#a85c38] text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                  {AGE_LABELS[plan.targetAge]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="pb-14 text-center">
          <p className="text-sm text-[#b09070]">まだ週案がありません。上の入力欄から始めましょう。</p>
        </div>
      )}
    </div>
  );
}
