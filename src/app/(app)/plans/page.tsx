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
    <div className="flex flex-col min-h-screen" style={{ background: "#FDF5E6" }}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: "rgba(255,183,178,0.12)", filter: "blur(48px)" }}/>
        <div className="absolute bottom-40 left-10 w-80 h-80 rounded-full" style={{ background: "rgba(178,226,242,0.1)", filter: "blur(56px)" }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full" style={{ background: "rgba(209,232,226,0.08)", filter: "blur(64px)" }}/>
      </div>

      {/* Hero area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10 pt-16">
        {/* Greeting */}
        <p className="text-sm mb-2" style={{ color: "#B0A090" }}>
          こんにちは、{user?.name ?? "保育士さん"}
        </p>
        <h1
          className="font-serif-jp font-bold mb-10 tracking-wide text-center"
          style={{ fontSize: "clamp(24px, 4vw, 36px)", color: "#4A4A4A", letterSpacing: "0.06em" }}
        >
          今週の様子を聞かせてください。
        </h1>

        {/* Input bar */}
        <div className="w-full max-w-2xl">
          <Link
            href="/weekly-plan/new"
            className="flex items-center rounded-full gap-3 group transition-all"
            style={{
              background: "rgba(255,255,255,0.82)",
              border: "1.5px solid rgba(255,183,178,0.35)",
              padding: "14px 20px",
              boxShadow: "0 4px 24px rgba(255,183,178,0.15), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: "rgba(255,183,178,0.2)", color: "#FFB7B2", border: "1px solid rgba(255,183,178,0.4)" }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="flex-1 text-sm" style={{ color: "#C4B4A4" }}>
              今週のクラスの様子を話してみましょう…
            </span>
            <div className="flex items-center gap-2 flex-shrink-0" style={{ color: "#D4C4B4" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                <path d="M3 9C3 12.3 5.7 15 9 15C12.3 15 15 12.3 15 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </Link>

          {/* Suggestion chips */}
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            {[
              { href: "/weekly-plan/new", label: "週案を作る",       icon: "pen"  },
              { href: "/community",       label: "コミュニティを見る", icon: "leaf" },
              { href: "/profile",         label: "マイページ",        icon: "user" },
            ].map(chip => (
              <Link
                key={chip.href}
                href={chip.href}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(255,183,178,0.3)",
                  color: "#9A8878",
                }}
              >
                <ChipIcon type={chip.icon} />
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent plans */}
      {plans.length > 0 && (
        <div className="relative z-10 px-6 pb-12 max-w-2xl mx-auto w-full">
          <p className="text-xs font-medium mb-3 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.08em" }}>
            最近の週案
          </p>
          <div
            className="glass rounded-3xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.88)" }}
          >
            {plans.map((plan, i) => (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-all"
                style={{
                  borderBottom: i < plans.length - 1 ? "1px solid rgba(255,183,178,0.12)" : "none",
                }}
              >
                <span style={{ color: "#D4C4B4" }} className="flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2H10L13 5V14H3V2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                    <path d="M10 2V5H13" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="flex-1 text-sm truncate" style={{ color: "#6A5A4A" }}>
                  {formatWeekRange(plan.weekStartDate)}
                  {plan.goal && (
                    <span className="ml-2 text-xs" style={{ color: "#B4A494" }}>
                      — {plan.goal.slice(0, 20)}{plan.goal.length > 20 ? "…" : ""}
                    </span>
                  )}
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(255,183,178,0.18)", color: "#B09080" }}
                >
                  {AGE_LABELS[plan.targetAge]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="relative z-10 pb-14 text-center">
          <p className="text-sm" style={{ color: "#C4B4A4" }}>まだ週案がありません。上の入力欄から始めましょう。</p>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center" style={{ background: "#384D48" }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          ことのは — 今日も一日、お疲れ様でした
        </p>
      </footer>
    </div>
  );
}

function ChipIcon({ type }: { type: string }) {
  if (type === "pen") return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (type === "leaf") return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M13 2C13 2 12 9 7 11C4 12 2 14 2 14C2 14 3 8 6 6C9 4 13 2 13 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
