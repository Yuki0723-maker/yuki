import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <main className="min-h-screen" style={{ background: "#FDF5E6" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <LeafLogo size={26} />
          <span className="font-serif-jp text-lg font-bold tracking-widest" style={{ color: "#4A4A4A", letterSpacing: "0.14em" }}>
            ことのは
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium px-6 py-2.5 rounded-full transition-all"
          style={{
            background: "rgba(255,255,255,0.8)",
            color: "#4A4A4A",
            border: "1px solid rgba(255,183,178,0.5)",
            boxShadow: "0 2px 12px rgba(255,183,178,0.2)",
          }}
        >
          ログインする
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16 flex flex-col lg:flex-row items-center gap-12">
        {/* Left: text */}
        <div className="flex-1 text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs mb-6"
            style={{ background: "rgba(209,232,226,0.6)", color: "#5A8A7A", border: "1px solid rgba(178,226,242,0.5)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB7B2] inline-block" />
            子どもの今を、言葉に。
          </div>

          <h1
            className="font-serif-jp font-bold leading-snug mb-4"
            style={{ fontSize: "clamp(28px, 5vw, 44px)", color: "#4A4A4A", letterSpacing: "0.03em" }}
          >
            先週のメモが、<br />
            <span style={{ color: "#FFB7B2" }}>週案になる。</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#7A6A5A" }}>
            「今日、○○ちゃんが転んで泣いた」——そのメモで十分。<br />
            AIが<strong style={{ color: "#4A4A4A", fontWeight: 500 }}>保育指針に沿った週案</strong>を自動で仕上げます。
          </p>

          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
            <Link
              href="/login"
              className="text-base font-medium px-8 py-3.5 rounded-full transition-all"
              style={{
                background: "linear-gradient(135deg, #FFB7B2 0%, #ffcac6 100%)",
                color: "#4A4A4A",
                boxShadow: "0 4px 20px rgba(255,183,178,0.4)",
              }}
            >
              無料で始める →
            </Link>
            <p className="text-xs" style={{ color: "#B0A098" }}>登録無料・クレジットカード不要</p>
          </div>

          {/* Flow steps */}
          <div className="flex items-center gap-3 mt-10 justify-center lg:justify-start">
            {[
              { step: "1", text: "様子をメモ" },
              { step: "2", text: "AIが週案に変換" },
              { step: "3", text: "すぐ提出" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1"
                    style={{ background: "rgba(255,183,178,0.2)", color: "#FFB7B2", border: "1px solid rgba(255,183,178,0.4)" }}
                  >
                    {item.step}
                  </div>
                  <p className="text-xs whitespace-nowrap" style={{ color: "#9A8878" }}>{item.text}</p>
                </div>
                {i < 2 && (
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="mb-4">
                    <path d="M1 5H15M11 1L15 5L11 9" stroke="#D1C4B8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: illustration */}
        <div className="flex-shrink-0 float-anim">
          <ChildcareIllustration />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <GuidanceIcon />,
              title: "保育指針に準拠",
              desc: "ねらい・内容・環境・援助を自動で構成します",
              color: "#FFB7B2",
            },
            {
              icon: <FormatIcon />,
              title: "各園フォーマット対応",
              desc: "施設タイプ・クラスに合った書式で作成できます",
              color: "#B2E2F2",
            },
            {
              icon: <ChatIcon />,
              title: "AIと対話しながら作成",
              desc: "週の様子を話すだけでAIが項目を埋めていきます",
              color: "#D1E8E2",
            },
          ].map((f, i) => (
            <div key={i} className="glass rounded-3xl p-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}30` }}
              >
                {f.icon}
              </div>
              <h3 className="font-serif-jp font-semibold text-sm mb-2" style={{ color: "#4A4A4A" }}>
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "#9A8878" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center" style={{ background: "#384D48" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <LeafLogo size={20} light />
          <span className="font-serif-jp text-sm font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.14em" }}>
            ことのは
          </span>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          ことのは — 今日も一日、お疲れ様でした
        </p>
        <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>© 2025 ことのは. All rights reserved.</p>
      </footer>
    </main>
  );
}

function LeafLogo({ size = 24, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
      <path
        d="M12 3 C12 3 5 8 5 14 C5 18 8.1 21 12 21 C15.9 21 19 18 19 14 C19 8 12 3 12 3Z"
        fill={light ? "rgba(209,232,226,0.6)" : "#D1E8E2"}
        stroke={light ? "rgba(209,232,226,0.4)" : "#B8D8CE"}
        strokeWidth="1"
      />
      <path d="M12 6 L12 19" stroke={light ? "rgba(255,255,255,0.5)" : "#9EC8BC"} strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 11 L15.5 9" stroke={light ? "rgba(255,255,255,0.4)" : "#9EC8BC"} strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M12 14 L15.5 12" stroke={light ? "rgba(255,255,255,0.4)" : "#9EC8BC"} strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}

function ChildcareIllustration() {
  return (
    <svg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="150" cy="220" rx="115" ry="10" fill="#D1E8E2" opacity="0.3"/>

      {/* Blocks */}
      <rect x="82" y="172" width="32" height="32" rx="7" fill="#FFB7B2" opacity="0.8"/>
      <rect x="82" y="144" width="32" height="30" rx="6" fill="#D1E8E2" opacity="0.85"/>
      <rect x="118" y="182" width="28" height="22" rx="6" fill="#B2E2F2" opacity="0.8"/>
      <rect x="152" y="188" width="22" height="16" rx="5" fill="#FFF0EB" stroke="#FFB7B2" strokeWidth="1.2" opacity="0.9"/>

      {/* Child */}
      <ellipse cx="110" cy="160" rx="16" ry="13" fill="#FCEADE" opacity="0.9"/>
      <path d="M95 165 Q87 178 92 186" stroke="#FCEADE" strokeWidth="10" strokeLinecap="round"/>
      <path d="M126 165 Q134 178 129 186" stroke="#FCEADE" strokeWidth="10" strokeLinecap="round"/>
      <path d="M95 163 Q95 178 110 178 Q125 178 125 163 Z" fill="#FFB7B2" opacity="0.35"/>
      <circle cx="110" cy="134" r="20" fill="#FCEADE" stroke="#FFB7B2" strokeWidth="0.8" opacity="0.95"/>
      <path d="M91 128 Q95 110 110 108 Q125 110 129 128" fill="#C8956C" opacity="0.35"/>
      <circle cx="101" cy="138" r="5" fill="#FFB7B2" opacity="0.28"/>
      <circle cx="119" cy="138" r="5" fill="#FFB7B2" opacity="0.28"/>
      <circle cx="104" cy="131" r="2.5" fill="#4A4A4A"/>
      <circle cx="116" cy="131" r="2.5" fill="#4A4A4A"/>
      <circle cx="105" cy="130" r="1" fill="white"/>
      <circle cx="117" cy="130" r="1" fill="white"/>
      <path d="M105 140 Q110 145 115 140" stroke="#C0826A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M126 157 Q138 165 133 177" stroke="#FFB7B2" strokeWidth="7" strokeLinecap="round" opacity="0.45"/>

      {/* Teacher */}
      <path d="M180 220 L177 168 Q187 161 197 168 L194 220 Z" fill="#D1E8E2" opacity="0.65"/>
      <ellipse cx="187" cy="163" rx="14" ry="13" fill="#FCEADE" opacity="0.9"/>
      <circle cx="187" cy="135" r="22" fill="#FCEADE" stroke="#D1E8E2" strokeWidth="0.8" opacity="0.95"/>
      <path d="M166 129 Q170 109 187 107 Q204 109 208 129" fill="#7A5540" opacity="0.38"/>
      <circle cx="206" cy="116" r="8" fill="#7A5540" opacity="0.28"/>
      <circle cx="176" cy="139" r="6" fill="#FFB7B2" opacity="0.22"/>
      <circle cx="198" cy="139" r="6" fill="#FFB7B2" opacity="0.22"/>
      <path d="M180 130 Q183 128 185 130" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M189 130 Q192 128 195 130" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M180 141 Q187 147 194 141" stroke="#C0826A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M174 165 Q158 176 145 184" stroke="#FCEADE" strokeWidth="12" strokeLinecap="round"/>
      <path d="M174 165 Q158 176 145 184" stroke="#D1E8E2" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>

      {/* Sun decoration */}
      <circle cx="252" cy="48" r="14" fill="#FFF0C0" opacity="0.5"/>
      <circle cx="252" cy="48" r="9" fill="#FFDC80" opacity="0.55"/>
      <path d="M252 26 L252 18" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M267 33 L273 27" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M274 48 L282 48" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M267 63 L273 69" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M237 33 L231 27" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M230 48 L222 48" stroke="#FFDC80" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>

      {/* Music note */}
      <path d="M42 62 L42 46 L54 42 L54 58" stroke="#B2E2F2" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7"/>
      <circle cx="40" cy="63" r="4.5" fill="#B2E2F2" opacity="0.6"/>
      <circle cx="52" cy="59" r="4.5" fill="#B2E2F2" opacity="0.6"/>

      {/* Sprout */}
      <path d="M265 198 L265 214" stroke="#D1E8E2" strokeWidth="2" strokeLinecap="round"/>
      <path d="M265 203 Q257 194 249 197 Q254 202 265 203" fill="#D1E8E2" opacity="0.7"/>
      <path d="M265 207 Q273 198 281 201 Q276 206 265 207" fill="#D1E8E2" opacity="0.7"/>

      {/* Crayon */}
      <rect x="32" y="185" width="8" height="28" rx="2" fill="#FFB7B2" opacity="0.6" transform="rotate(-20 36 199)"/>
      <path d="M28 207 L36 199" stroke="#FFB7B2" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function GuidanceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 3H16L20 7V21H4V3Z" stroke="#FFB7B2" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <line x1="7" y1="9" x2="15" y2="9" stroke="#FFB7B2" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="15" y2="12" stroke="#FFB7B2" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7" y1="15" x2="11" y2="15" stroke="#FFB7B2" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#B2E2F2" strokeWidth="1.5" fill="none"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="#B2E2F2" strokeWidth="1.2"/>
      <line x1="3" y1="15" x2="21" y2="15" stroke="#B2E2F2" strokeWidth="1.2"/>
      <line x1="9" y1="9" x2="9" y2="21" stroke="#B2E2F2" strokeWidth="1.2"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H20V16H13L8 20V16H4V4Z" stroke="#D1E8E2" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="9" cy="10" r="1.2" fill="#D1E8E2"/>
      <circle cx="12" cy="10" r="1.2" fill="#D1E8E2"/>
      <circle cx="15" cy="10" r="1.2" fill="#D1E8E2"/>
    </svg>
  );
}
