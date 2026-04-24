import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata: Metadata = { title: "ログイン | ことのは" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <div className="min-h-screen flex">
      {/* ── Left watercolor panel ── */}
      <div
        className="hidden lg:block w-1/2 relative overflow-hidden"
        style={{
          background: [
            "radial-gradient(ellipse 75% 65% at 15% 20%, rgba(175,218,238,0.98) 0%, transparent 65%)",
            "radial-gradient(ellipse 70% 60% at 82% 12%, rgba(155,208,230,0.85) 0%, transparent 62%)",
            "radial-gradient(ellipse 62% 58% at 58% 52%, rgba(188,228,208,0.72) 0%, transparent 62%)",
            "radial-gradient(ellipse 68% 62% at 18% 82%, rgba(255,182,175,0.72) 0%, transparent 65%)",
            "radial-gradient(ellipse 60% 55% at 88% 82%, rgba(255,198,188,0.62) 0%, transparent 60%)",
            "#BED9EC",
          ].join(", "),
        }}
      >
        {/* Sun – upper right */}
        <div className="absolute" style={{ top: 60, right: 90 }}>
          <DecorSun size={72} />
        </div>

        {/* Music notes – scattered */}
        <div className="absolute" style={{ top: 85,  left: 82  }}><DecorNote size={28} /></div>
        <div className="absolute" style={{ top: 145, left: 195 }}><DecorNote size={22} /></div>
        <div className="absolute" style={{ top: 230, left: 110 }}><DecorNote size={18} /></div>
        <div className="absolute" style={{ top: 200, right: 170 }}><DecorNote size={25} /></div>
        <div className="absolute" style={{ top: 340, right: 100 }}><DecorNote size={20} /></div>
        <div className="absolute" style={{ top: 430, left: 240 }}><DecorNote size={16} /></div>

        {/* Crayons – lower-left cluster */}
        <div className="absolute" style={{ bottom: 190, left: 55 }}>
          <DecorCrayons />
        </div>

        {/* Plant sprout – lower-right area */}
        <div className="absolute" style={{ bottom: 158, right: 110 }}>
          <DecorPlant size={54} />
        </div>

        {/* Brand card – bottom-left */}
        <div className="absolute" style={{ bottom: 48, left: 48 }}>
          <div
            className="rounded-3xl px-8 py-6"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <LeafLogo />
              <span className="font-serif-jp text-lg font-bold" style={{ color: "#4A4A4A", letterSpacing: "0.12em" }}>
                ことのは
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#6A8A7A" }}>
              子どもの今を、言葉に。<br />
              保育士さんのためのAI週案アシスタント
            </p>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ background: "#FDF5E6" }}>
        <div className="w-full max-w-sm">
          {/* Logo + tagline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <LeafLogo />
              <span className="font-serif-jp text-xl font-bold" style={{ color: "#4A4A4A", letterSpacing: "0.14em" }}>
                ことのは
              </span>
            </Link>
            <p className="mt-2 text-sm" style={{ color: "#A09080" }}>子どもの今を、言葉に。</p>
          </div>

          {/* Form card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "white",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            }}
          >
            <LoginForm />
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#B0A090" }}>
            © 2026 ことのは
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Shared SVG decorations ── */

function LeafLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C12 3 5 8 5 14 C5 18 8.1 21 12 21 C15.9 21 19 18 19 14 C19 8 12 3 12 3Z" fill="#D1E8E2" stroke="#B8D8CE" strokeWidth="1"/>
      <path d="M12 6 L12 19" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 11 L15.5 9" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M12 14 L15.5 12" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}

function DecorSun({ size = 70 }: { size?: number }) {
  const r = size / 2;
  const inner = r * 0.38;
  return (
    <svg width={size + 20} height={size + 20} viewBox="0 0 90 90" fill="none">
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 45 + (inner + 4) * Math.cos(rad);
        const y1 = 45 + (inner + 4) * Math.sin(rad);
        const x2 = 45 + (r + 8) * Math.cos(rad);
        const y2 = 45 + (r + 8) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFDB36" strokeWidth="2.8" strokeLinecap="round"/>;
      })}
      <circle cx="45" cy="45" r={r} fill="#FFE868" stroke="#FFD040" strokeWidth="0.8"/>
      {/* Eyes */}
      <ellipse cx="38" cy="40" rx="2.8" ry="3.4" fill="#5A4015"/>
      <ellipse cx="52" cy="40" rx="2.8" ry="3.4" fill="#5A4015"/>
      {/* Smile */}
      <path d="M37 54 Q45 63 53 54" stroke="#5A4015" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Cheeks */}
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
    { body: "#7BBF72", dark: "#5EA055", light: "rgba(255,255,255,0.28)" },
    { body: "#6AB068", dark: "#529050", light: "rgba(255,255,255,0.24)" },
    { body: "#88C880", dark: "#6AAA60", light: "rgba(255,255,255,0.32)" },
  ];
  const angles = [-30, -12, 8];
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none">
      {colors.map((c, i) => {
        const cx = 38 + i * 26;
        const cy = 65;
        const rot = angles[i];
        return (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <rect x="-7" y="-50" width="14" height="68" rx="4" fill={c.body}/>
            <path d="M-7 18 L0 34 L7 18 Z" fill={c.dark}/>
            <rect x="-5" y="-35" width="5" height="45" rx="2.5" fill={c.light}/>
          </g>
        );
      })}
    </svg>
  );
}

function DecorPlant({ size = 54 }: { size?: number }) {
  const s = size / 54;
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 54 70" fill="none">
      <path d="M27 70 L27 35" stroke="#7DB880" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M27 48 Q42 36 46 46 Q42 56 27 52 Z" fill="#7DB880"/>
      <path d="M27 38 Q12 26 8 36 Q12 46 27 42 Z" fill="#9DC89E" opacity="0.85"/>
      <path d="M27 62 Q40 52 43 61 Q40 70 27 66 Z" fill="#9DC89E" opacity="0.7"/>
    </svg>
  );
}
