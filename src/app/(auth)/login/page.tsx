import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "ログイン" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <div className="min-h-screen flex">
      {/* Left illustration panel */}
      <div className="hidden lg:flex w-1/2 bg-[#3d2b1f] items-center justify-center relative overflow-hidden">
        {/* Subtle texture dots */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #e8a87c 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow accents */}
        <div className="absolute top-16 right-16 w-64 h-64 bg-[#d4845a]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-12 w-48 h-48 bg-[#e8a87c]/10 rounded-full blur-2xl" />

        {/* SVG Cafe Illustration */}
        <div className="relative z-10 flex flex-col items-center gap-10 px-12">
          <CafeIllustration />
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#f5f0e8] tracking-wide mb-3">HoikuNote</h2>
            <p className="text-[#d4c4a8] text-sm leading-relaxed">
              子どもたちの毎日をメモするだけで<br />
              AIが週案を自動作成してくれる<br />
              保育士さんのための静かな場所
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6 bg-[#faf8f3]">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <CupIcon />
              <span className="text-2xl font-bold text-[#3d2b1f] tracking-wide">HoikuNote</span>
            </Link>
            <p className="mt-2 text-sm text-[#a08060]">保育士さんのためのAI週案アシスタント</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[#ece4d4] p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function CafeIllustration() {
  return (
    <svg width="260" height="220" viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Window frame */}
      <rect x="30" y="20" width="200" height="160" rx="4" stroke="#e8a87c" strokeWidth="2.5" fill="none" opacity="0.6"/>
      {/* Window cross */}
      <line x1="130" y1="20" x2="130" y2="180" stroke="#e8a87c" strokeWidth="1.5" opacity="0.4"/>
      <line x1="30" y1="100" x2="230" y2="100" stroke="#e8a87c" strokeWidth="1.5" opacity="0.4"/>

      {/* Plant left */}
      <line x1="55" y1="175" x2="55" y2="130" stroke="#8a9a6a" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="48" cy="122" rx="12" ry="8" fill="#8a9a6a" opacity="0.7" transform="rotate(-20 48 122)"/>
      <ellipse cx="62" cy="118" rx="10" ry="7" fill="#9aaa7a" opacity="0.6" transform="rotate(15 62 118)"/>
      <ellipse cx="52" cy="112" rx="9" ry="6" fill="#8a9a6a" opacity="0.8" transform="rotate(-5 52 112)"/>
      {/* Plant pot */}
      <path d="M46 175 Q55 178 64 175 L61 188 Q55 191 49 188 Z" fill="#d4845a" opacity="0.7"/>
      <rect x="44" y="172" width="22" height="5" rx="2" fill="#c4704a" opacity="0.7"/>

      {/* Coffee cup center */}
      <ellipse cx="130" cy="145" rx="28" ry="6" fill="#c4704a" opacity="0.15"/>
      <path d="M105 115 Q105 145 130 145 Q155 145 155 115 Z" fill="#faf8f3" stroke="#d4845a" strokeWidth="2"/>
      <path d="M105 115 Q117 125 130 125 Q143 125 155 115" stroke="#d4845a" strokeWidth="2" fill="none"/>
      <rect x="104" y="108" width="52" height="10" rx="5" fill="#faf8f3" stroke="#d4845a" strokeWidth="2"/>
      {/* Cup handle */}
      <path d="M155 118 Q168 118 168 127 Q168 136 155 136" stroke="#d4845a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Saucer */}
      <ellipse cx="130" cy="147" rx="34" ry="5" fill="none" stroke="#d4845a" strokeWidth="1.5"/>
      {/* Steam */}
      <path d="M118 100 Q115 93 118 86 Q121 79 118 72" stroke="#e8a87c" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M130 98 Q127 91 130 84 Q133 77 130 70" stroke="#e8a87c" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M142 100 Q139 93 142 86 Q145 79 142 72" stroke="#e8a87c" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>

      {/* Plant right */}
      <line x1="205" y1="175" x2="205" y2="135" stroke="#8a9a6a" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="198" cy="128" rx="11" ry="7" fill="#8a9a6a" opacity="0.6" transform="rotate(-15 198 128)"/>
      <ellipse cx="212" cy="124" rx="10" ry="7" fill="#9aaa7a" opacity="0.7" transform="rotate(20 212 124)"/>
      <ellipse cx="204" cy="118" rx="9" ry="6" fill="#8a9a6a" opacity="0.8" transform="rotate(-8 204 118)"/>
      {/* Plant pot right */}
      <path d="M196 175 Q205 178 214 175 L211 188 Q205 191 199 188 Z" fill="#d4845a" opacity="0.7"/>
      <rect x="194" y="172" width="22" height="5" rx="2" fill="#c4704a" opacity="0.7"/>

      {/* Small book on table */}
      <rect x="90" y="148" width="25" height="4" rx="1" fill="#a85c38" opacity="0.5"/>
      <rect x="92" y="144" width="21" height="6" rx="1" fill="#c4704a" opacity="0.4"/>

      {/* Stars/sparkles */}
      <circle cx="75" cy="55" r="1.5" fill="#e8a87c" opacity="0.5"/>
      <circle cx="185" cy="45" r="1" fill="#e8a87c" opacity="0.4"/>
      <circle cx="200" cy="70" r="2" fill="#e8a87c" opacity="0.3"/>
      <circle cx="60" cy="75" r="1.5" fill="#e8a87c" opacity="0.4"/>
    </svg>
  );
}

function CupIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 10 Q5 21 14 21 Q23 21 23 10 Z" fill="none" stroke="#3d2b1f" strokeWidth="1.8"/>
      <rect x="4.5" y="7" width="19" height="5" rx="2.5" fill="none" stroke="#3d2b1f" strokeWidth="1.8"/>
      <path d="M23 12 Q28 12 28 16 Q28 20 23 20" stroke="#3d2b1f" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M10 4 Q9 2 10 0" stroke="#c4704a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M14 3 Q13 1 14 -1" stroke="#c4704a" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M18 4 Q17 2 18 0" stroke="#c4704a" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
