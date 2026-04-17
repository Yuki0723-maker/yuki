import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <main className="min-h-screen" style={{ background: "#faf8f3" }}>
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <CupLogo />
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#3d2b1f", letterSpacing: "0.03em" }}>HoikuNote</span>
        </div>
        <Link
          href="/login"
          style={{ background: "#3d2b1f", color: "#fff", fontSize: "14px", fontWeight: 500, padding: "10px 24px", borderRadius: "999px", textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: "44px" }}
        >
          ログインする
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-12 pb-8">
        <div style={{ background: "#faf8f3", borderRadius: "12px", padding: "3rem 2rem 2.5rem", textAlign: "center" }}>

          {/* Pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "999px", padding: "4px 14px", fontSize: "12px", color: "#7a4f3a", marginBottom: "1.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c0622f", flexShrink: 0, display: "inline-block" }} />
            入力30秒、週案5分で完成
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: "36px", fontWeight: 500, color: "#3d2b1f", lineHeight: 1.35, marginBottom: "0.5rem" }}>
            その日のメモが、<br />
            <span style={{ color: "#c0622f" }}>週案になる。</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#7a4f3a", marginBottom: "1.5rem" }}>保育士のための、AI指導計画サービス</p>

          {/* Flow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.75rem", maxWidth: "520px" }}>
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "10px 16px", flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#7a4f3a", marginBottom: "3px" }}>step 1</div>
              <div style={{ fontSize: "13px", color: "#3d2b1f", fontWeight: 500, lineHeight: 1.5 }}>今日の様子を<br />メモする</div>
            </div>
            <div style={{ flexShrink: 0, width: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="#c0622f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "10px 16px", flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#7a4f3a", marginBottom: "3px" }}>step 2</div>
              <div style={{ fontSize: "13px", color: "#3d2b1f", fontWeight: 500, lineHeight: 1.5 }}>AIが週案に<br />自動変換</div>
            </div>
            <div style={{ flexShrink: 0, width: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="#c0622f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "10px 16px", flex: 1 }}>
              <div style={{ fontSize: "11px", color: "#7a4f3a", marginBottom: "3px" }}>step 3</div>
              <div style={{ fontSize: "13px", color: "#3d2b1f", fontWeight: 500, lineHeight: 1.5 }}>PDF・LINEで<br />すぐ提出</div>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: "14px", color: "#3d2b1f", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "440px", marginLeft: "auto", marginRight: "auto" }}>
            「今日、○○ちゃんが転んで泣いた」——そのメモで十分。<br />
            AIが<span style={{ color: "#c0622f", fontWeight: 500 }}>保育指針に沿った週案</span>を自動で仕上げます。<br />
            書き方に迷う時間も、もう要りません。
          </p>

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Link
              href="/login"
              style={{ background: "#3d2b1f", color: "#fff", fontSize: "16px", fontWeight: 500, padding: "14px 40px", borderRadius: "999px", textDecoration: "none", display: "inline-block" }}
            >
              無料で始める →
            </Link>
            <span style={{ fontSize: "12px", color: "#7a4f3a" }}>Googleアカウントで即時登録・完全無料</span>
          </div>

          {/* Features */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px", marginTop: "2rem" }}>
            {/* Feature 1 */}
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "16px 14px", textAlign: "left" }}>
              <div style={{ width: "44px", height: "44px", background: "#f0e8df", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="4" y="3" width="14" height="18" rx="2" fill="#f0e8df" stroke="#c0622f" strokeWidth="1.3"/>
                  <line x1="7.5" y1="8" x2="14.5" y2="8" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="7.5" y1="11" x2="14.5" y2="11" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="7.5" y1="14" x2="11.5" y2="14" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <rect x="2.5" y="5" width="3" height="14" rx="1" fill="#f0e8df" stroke="#c0622f" strokeWidth="1.1"/>
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#3d2b1f", marginBottom: "3px" }}>保育指針に準拠</div>
              <div style={{ fontSize: "12px", color: "#7a4f3a", lineHeight: 1.55 }}>ねらい・内容・環境・援助を自動で構成</div>
            </div>

            {/* Feature 2 */}
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "16px 14px", textAlign: "left" }}>
              <div style={{ width: "44px", height: "44px", background: "#f0e8df", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="3" y="4" width="16" height="20" rx="2" fill="#fff" stroke="#c0622f" strokeWidth="1.3"/>
                  <line x1="6.5" y1="9" x2="15.5" y2="9" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="6.5" y1="12.5" x2="15.5" y2="12.5" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="6.5" y1="16" x2="11" y2="16" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <path d="M17 18.5l4.5-4.5-2-2-4.5 4.5V19h1.5z" fill="#f0e8df" stroke="#c0622f" strokeWidth="1.1" strokeLinejoin="round"/>
                  <path d="M19.5 14l2 2" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#3d2b1f", marginBottom: "3px" }}>各園フォーマット対応</div>
              <div style={{ fontSize: "12px", color: "#7a4f3a", lineHeight: 1.55 }}>園独自の書式でPDF出力が可能</div>
            </div>

            {/* Feature 3 */}
            <div style={{ background: "#fff", border: "0.5px solid #d4b8a0", borderRadius: "8px", padding: "16px 14px", textAlign: "left" }}>
              <div style={{ width: "44px", height: "44px", background: "#f0e8df", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="4" y="2" width="11" height="15" rx="1.5" fill="#fff" stroke="#c0622f" strokeWidth="1.3"/>
                  <line x1="6.5" y1="6" x2="12.5" y2="6" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="6.5" y1="8.5" x2="12.5" y2="8.5" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="6.5" y1="11" x2="10" y2="11" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round"/>
                  <circle cx="19" cy="19" r="4" fill="#f0e8df" stroke="#c0622f" strokeWidth="1.2"/>
                  <path d="M17.5 19l1 1 2-2" stroke="#c0622f" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#3d2b1f", marginBottom: "3px" }}>LINEにも送れる</div>
              <div style={{ fontSize: "12px", color: "#7a4f3a", lineHeight: 1.55 }}>スマホからすぐに作成・共有</div>
            </div>
          </div>

        </div>
      </section>

      <footer style={{ borderTop: "1px solid #ece4d4", padding: "2rem 0", textAlign: "center", fontSize: "12px", color: "#b09070" }}>
        © 2025 HoikuNote. All rights reserved.
      </footer>
    </main>
  );
}

function CupLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 9 Q4 18 11 18 Q18 18 18 9 Z" stroke="#3d2b1f" strokeWidth="1.6" fill="none"/>
      <rect x="3.5" y="6" width="15" height="4" rx="2" stroke="#3d2b1f" strokeWidth="1.6" fill="none"/>
      <path d="M18 10 Q22 10 22 13 Q22 16 18 16" stroke="#3d2b1f" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M8 3.5 Q7.5 2 8 0.5" stroke="#c0622f" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 3 Q10.5 1.5 11 0" stroke="#c0622f" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M14 3.5 Q13.5 2 14 0.5" stroke="#c0622f" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
