import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatWeekRange, AGE_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "ホーム | ことのは" };

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
    <div className="relative flex flex-col min-h-screen" style={{ background: "#FDF5E6" }}>

      {/* ── Soft blurred background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full" style={{ background: "rgba(255,183,178,0.11)", filter: "blur(48px)" }}/>
        <div className="absolute bottom-40 left-10 w-80 h-80 rounded-full" style={{ background: "rgba(178,226,242,0.09)", filter: "blur(56px)" }}/>
      </div>

      {/* ── Illustrated floating decorations ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {/* Sun – top right */}
        <div className="absolute" style={{ top: 38, right: 48 }}>
          <DecorSun size={72} />
        </div>
        {/* Music notes */}
        <div className="absolute" style={{ top: 70,  left: "28%" }}><DecorNote size={30} /></div>
        <div className="absolute" style={{ top: 44,  left: "42%" }}><DecorNote size={24} /></div>
        <div className="absolute" style={{ top: 155, left: "22%" }}><DecorNote size={20} /></div>
        {/* Crayons – lower left area */}
        <div className="absolute" style={{ bottom: 200, left: "18%" }}>
          <DecorCrayons />
        </div>
        {/* Plant – lower right area */}
        <div className="absolute" style={{ bottom: 200, right: 140 }}>
          <DecorPlant size={54} />
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-10 pt-16" style={{ zIndex: 10 }}>
        <p className="text-sm mb-2" style={{ color: "#B0A090" }}>
          こんにちは、{user?.name ?? "保育士さん"}
        </p>
        <h1
          className="font-serif-jp font-bold mb-10 tracking-wide text-center"
          style={{ fontSize: "clamp(24px, 4vw, 38px)", color: "#4A4A4A", letterSpacing: "0.06em" }}
        >
          今週の様子を聞かせてください。
        </h1>

        {/* Input bar */}
        <div className="w-full max-w-2xl">
          <Link
            href="/weekly-plan/new"
            className="flex items-center rounded-full gap-3 transition-all"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "1.5px solid rgba(255,183,178,0.38)",
              padding: "14px 20px",
              boxShadow: "0 4px 28px rgba(255,183,178,0.18), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,183,178,0.22)", color: "#FFB7B2", border: "1px solid rgba(255,183,178,0.4)" }}
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

          {/* Quick-action chips */}
          <div className="flex gap-3 mt-5 justify-center flex-wrap">
            {([
              { href: "/weekly-plan/new", label: "週案を作る",        icon: "pen",  bg: "rgba(255,183,178,0.28)", border: "rgba(255,183,178,0.5)",  color: "#B07870" },
              { href: "/community",       label: "コミュニティを見る", icon: "leaf", bg: "rgba(209,232,226,0.35)", border: "rgba(160,210,185,0.55)", color: "#5A9070" },
              { href: "/profile",         label: "マイページ",         icon: "user", bg: "rgba(178,226,242,0.32)", border: "rgba(140,200,228,0.5)",  color: "#5888A8" },
            ] as const).map(chip => (
              <Link
                key={chip.href}
                href={chip.href}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: chip.bg,
                  border: `1px solid ${chip.border}`,
                  color: chip.color,
                }}
              >
                <ChipIcon type={chip.icon} />
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent plans ── */}
      {plans.length > 0 && (
        <div className="relative px-6 pb-12 max-w-2xl mx-auto w-full" style={{ zIndex: 10 }}>
          <p className="text-xs font-medium mb-3 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.08em" }}>
            最近の週案
          </p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
          >
            {plans.map((plan, i) => (
              <Link
                key={plan.id}
                href={`/plan/${plan.id}`}
                className="flex items-center gap-3 px-5 py-4 transition-all hover:bg-white"
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
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full flex-shrink-0"
                  style={{ background: "rgba(255,183,178,0.22)", color: "#B07878" }}
                >
                  {AGE_LABELS[plan.targetAge]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {plans.length === 0 && (
        <div className="relative pb-14 text-center" style={{ zIndex: 10 }}>
          <p className="text-sm" style={{ color: "#C4B4A4" }}>まだ週案がありません。上の入力欄から始めましょう。</p>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="relative py-6 text-center" style={{ background: "#384D48", zIndex: 10 }}>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          ことのは — 今日も一日、お疲れ様でした
        </p>
      </footer>
    </div>
  );
}

/* ── Shared SVG decorations ── */

function DecorSun({ size = 70 }: { size?: number }) {
  const r = size / 2;
  return (
    <svg width={size + 20} height={size + 20} viewBox="0 0 90 90" fill="none">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 45 + (r * 0.42) * Math.cos(rad);
        const y1 = 45 + (r * 0.42) * Math.sin(rad);
        const x2 = 45 + (r + 7) * Math.cos(rad);
        const y2 = 45 + (r + 7) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFDB36" strokeWidth="2.8" strokeLinecap="round"/>;
      })}
      <circle cx="45" cy="45" r={r} fill="#FFE868" stroke="#FFD040" strokeWidth="0.8"/>
      <ellipse cx="38" cy="40" rx="2.8" ry="3.4" fill="#5A4015"/>
      <ellipse cx="52" cy="40" rx="2.8" ry="3.4" fill="#5A4015"/>
      <path d="M37 54 Q45 63 53 54" stroke="#5A4015" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="33" cy="52" r="5" fill="rgba(255,140,110,0.3)"/>
      <circle cx="57" cy="52" r="5" fill="rgba(255,140,110,0.3)"/>
    </svg>
  );
}

function DecorNote({ size = 24 }: { size?: number }) {
  const color = "#9ABCE0";
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 24 36" fill="none">
      <ellipse cx="8" cy="30" rx="8" ry="6" fill={color} transform="rotate(-18 8 30)"/>
      <line x1="15.5" y1="25" x2="15.5" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M15.5 4 Q23 8 20 16 Q17 24 15.5 25" fill={color}/>
    </svg>
  );
}

function DecorCrayons() {
  const colors = [
    { body: "#7BBF72", dark: "#5EA055" },
    { body: "#6AB068", dark: "#529050" },
    { body: "#88C880", dark: "#6AAA60" },
  ];
  const angles = [-32, -12, 9];
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
      {colors.map((c, i) => {
        const cx = 36 + i * 28;
        const cy = 68;
        const rot = angles[i];
        return (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <rect x="-7" y="-50" width="14" height="68" rx="4" fill={c.body}/>
            <path d="M-7 18 L0 34 L7 18 Z" fill={c.dark}/>
            <rect x="-5" y="-36" width="5" height="47" rx="2.5" fill="rgba(255,255,255,0.28)"/>
          </g>
        );
      })}
    </svg>
  );
}

function DecorPlant({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 54 70" fill="none">
      <path d="M27 70 L27 35" stroke="#7DB880" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M27 48 Q42 36 46 46 Q42 56 27 52 Z" fill="#7DB880"/>
      <path d="M27 38 Q12 26 8 36 Q12 46 27 42 Z" fill="#9DC89E" opacity="0.85"/>
      <path d="M27 62 Q40 52 43 61 Q40 70 27 66 Z" fill="#9DC89E" opacity="0.7"/>
    </svg>
  );
}

function ChipIcon({ type }: { type: "pen" | "leaf" | "user" }) {
  if (type === "pen") return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (type === "leaf") return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M13 2C13 2 12 9 7 11C4 12 2 14 2 14C2 14 3 8 6 6C9 4 13 2 13 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
