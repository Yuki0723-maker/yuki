import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <main className="min-h-screen" style={{ background: "#FDF5E6", fontFamily: "'Zen Maru Gothic', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ padding: "30px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 24, color: "#4A4A4A" }}>
            <LeafLogo />
            <span style={{ marginLeft: 10 }}>ことのは</span>
          </div>
          <Link
            href="/login"
            style={{
              background: "white",
              color: "#4A4A4A",
              border: "1px solid #DEDEDE",
              padding: "10px 24px",
              borderRadius: 50,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
          >
            ログインする
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ padding: "80px 0 100px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>

          {/* Left: text */}
          <div style={{ maxWidth: 580 }}>
            <span style={{
              display: "inline-block",
              background: "#E2F2EE",
              color: "#6C7A78",
              padding: "8px 16px",
              borderRadius: 50,
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 24,
            }}>
              子どもの今を、言葉に。
            </span>

            <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.4, marginBottom: 20, color: "#4A4A4A" }}>
              先週のメモが、<br />
              <span style={{ color: "#FFB7B2" }}>週案になる。</span>
            </h1>

            <p style={{ fontSize: 16, marginBottom: 40, color: "#7A7A7A", lineHeight: 1.8 }}>
              「今日、○○ちゃんが転んで泣いた」——そのメモで十分。<br />
              AIが保育指針に沿った週案を自動で仕上げます。
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 60, flexWrap: "wrap" }}>
              <Link
                href="/login"
                style={{
                  background: "#FFB7B2",
                  color: "white",
                  border: "none",
                  padding: "18px 36px",
                  borderRadius: 50,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  boxShadow: "0 4px 10px rgba(255,183,178,0.4)",
                  transition: "all 0.3s ease",
                }}
              >
                無料で始める
                <span style={{ marginLeft: 10, fontSize: 20 }}>→</span>
              </Link>
              <span style={{ fontSize: 12, color: "#A0A0A0" }}>登録無料・クレジットカード不要</span>
            </div>

            {/* Step flow */}
            <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
              {[
                { step: "1", text: "様子をメモ" },
                { step: "2", text: "AIが週案に変換" },
                { step: "3", text: "すぐ提出" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 40 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: 14, color: "#7A7A7A" }}>
                    <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 32, color: "#FFCDCB", marginBottom: -10 }}>
                      {item.step}
                    </span>
                    <span>{item.text}</span>
                  </div>
                  {i < 2 && (
                    <span style={{ color: "#E0E0E0", fontSize: 24, marginTop: 20 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div style={{ position: "relative", width: 400, height: 400, flexShrink: 0 }}>
            {/* Music note */}
            <div style={{ position: "absolute", top: 0, left: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8CEF1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>

            {/* Sun */}
            <div style={{ position: "absolute", top: -10, left: 280 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="8" stroke="#FFE7BA" strokeWidth="1.5" fill="rgba(255,231,186,0.4)"/>
                <line x1="20" y1="2" x2="20" y2="6" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="20" y1="34" x2="20" y2="38" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="2" y1="20" x2="6" y2="20" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="34" y1="20" x2="38" y2="20" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7.28" y1="7.28" x2="10.11" y2="10.11" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="29.89" y1="29.89" x2="32.72" y2="32.72" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7.28" y1="32.72" x2="10.11" y2="29.89" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="29.89" y1="10.11" x2="32.72" y2="7.28" stroke="#FFE7BA" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Main illustration */}
            <div style={{ position: "absolute", top: 50, left: 50 }}>
              <svg width="220" height="150" viewBox="0 0 220 150" fill="none">
                {/* Child */}
                <circle cx="70" cy="60" r="25" fill="#FFE0DD" stroke="#4A4A4A" strokeWidth="0.5"/>
                <path d="M60 55C60 55 65 52 70 55C75 58 80 55 80 55" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round"/>
                <rect x="50" y="85" width="40" height="50" rx="10" fill="#FFCDCB" stroke="#4A4A4A" strokeWidth="0.5"/>
                {/* Teacher */}
                <circle cx="150" cy="50" r="25" fill="#FDF5E6" stroke="#4A4A4A" strokeWidth="0.5"/>
                <path d="M140 45C140 45 145 42 150 45C155 48 160 45 160 45" stroke="#4A4A4A" strokeWidth="1" strokeLinecap="round"/>
                <path d="M130 75C130 75 140 100 160 100C180 100 190 75 190 75" fill="#E2F2EE" stroke="#4A4A4A" strokeWidth="0.5"/>
                {/* Blocks */}
                <rect x="55" y="110" width="15" height="15" rx="3" fill="#FFE7BA" stroke="#4A4A4A" strokeWidth="0.5"/>
                <rect x="75" y="110" width="15" height="15" rx="3" fill="#A8CEF1" stroke="#4A4A4A" strokeWidth="0.5"/>
                <rect x="65" y="95" width="15" height="15" rx="3" fill="#D1E8E2" stroke="#4A4A4A" strokeWidth="0.5"/>
              </svg>
            </div>

            {/* Crayon */}
            <div style={{ position: "absolute", top: 220, left: -30, transform: "rotate(-15deg)" }}>
              <svg width="60" height="15" viewBox="0 0 60 15" fill="none">
                <rect x="0" y="0" width="50" height="15" rx="2" fill="#D1E8E2" stroke="#4A4A4A" strokeWidth="0.5"/>
                <path d="M50 0L60 7.5L50 15V0Z" fill="#D1E8E2" stroke="#4A4A4A" strokeWidth="0.5"/>
                <rect x="5" y="2" width="40" height="11" rx="1" fill="rgba(255,255,255,0.3)"/>
              </svg>
            </div>

            {/* Blanket */}
            <div style={{ position: "absolute", top: 120, left: 350 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="0" y="0" width="40" height="30" rx="5" fill="#F0F8FF" stroke="#4A4A4A" strokeWidth="0.5"/>
                <path d="M10 10C10 10 15 5 20 10C25 15 30 10 30 10" stroke="#4A4A4A" strokeWidth="0.5" strokeLinecap="round"/>
                <circle cx="10" cy="20" r="2" fill="rgba(74,74,74,0.1)"/>
                <circle cx="20" cy="20" r="2" fill="rgba(74,74,74,0.1)"/>
                <circle cx="30" cy="20" r="2" fill="rgba(74,74,74,0.1)"/>
              </svg>
            </div>

            {/* Leaf */}
            <div style={{ position: "absolute", top: 240, left: 330 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22V12" stroke="#D1E8E2" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 12C12 12 15 8 20 8C20 8 18 14 12 12Z" fill="rgba(209,232,226,0.6)" stroke="#D1E8E2" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 12C12 12 9 10 4 10C4 10 6 16 12 12Z" fill="rgba(209,232,226,0.4)" stroke="#D1E8E2" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "0 0 120px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
          {[
            {
              icon: <GuidanceIcon />,
              title: "保育指針に準拠",
              desc: "ねらい・内容・環境・援助を自動で構成します",
            },
            {
              icon: <FormatIcon />,
              title: "各園フォーマット対応",
              desc: "施設タイプ・クラスに合った書式で作成できます",
            },
            {
              icon: <ChatIcon />,
              title: "AIと対話しながら作成",
              desc: "週の様子を話すだけでAIが項目を埋めていきます",
            },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 20,
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                background: "#E2F2EE",
                borderRadius: 15,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 20, marginBottom: 15, color: "#4A4A4A" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "#7A7A7A" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#384D48", color: "white", padding: "50px 0", textAlign: "center", fontSize: 14 }}>
        <p style={{ letterSpacing: "0.1em" }}>ことのは — 今日も一日、お疲れ様でした</p>
      </footer>
    </main>
  );
}

function LeafLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 3 C12 3 5 8 5 14 C5 18 8.1 21 12 21 C15.9 21 19 18 19 14 C19 8 12 3 12 3Z" fill="#D1E8E2" stroke="#B8D8CE" strokeWidth="1"/>
      <path d="M12 6 L12 19" stroke="#9EC8BC" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 11 L15.5 9" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M12 14 L15.5 12" stroke="#9EC8BC" strokeWidth="0.8" strokeLinecap="round"/>
    </svg>
  );
}

function GuidanceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB7B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B2E2F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1E8E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="12" y2="13"/>
    </svg>
  );
}
