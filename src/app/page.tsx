import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/plans");

  return (
    <main className="min-h-screen" style={{ background: "#FDF5E6", fontFamily: "'Zen Maru Gothic', sans-serif", overflowX: "hidden" }}>

      {/* 背景装飾 */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -80, width: 420, height: 420, borderRadius: "50%", background: "rgba(255,183,178,0.13)", filter: "blur(70px)" }}/>
        <div style={{ position: "absolute", bottom: 80, left: -100, width: 480, height: 480, borderRadius: "50%", background: "rgba(178,226,242,0.11)", filter: "blur(80px)" }}/>
        <div style={{ position: "absolute", top: "45%", right: "10%", width: 320, height: 320, borderRadius: "50%", background: "rgba(209,232,226,0.1)", filter: "blur(60px)" }}/>
        <div style={{ position: "absolute", top: "20%", left: "8%", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,220,180,0.09)", filter: "blur(60px)" }}/>
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, padding: "28px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 22, color: "#4A4A4A" }}>
            <LeafLogo />
            ことのは
          </div>
          <Link
            href="/login"
            style={{
              background: "white",
              color: "#6A6A6A",
              border: "1px solid #E0DADA",
              padding: "10px 26px",
              borderRadius: 50,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            ログインする
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 10, padding: "clamp(40px,6vw,72px) 0 clamp(48px,6vw,80px)", textAlign: "center" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 clamp(20px,5vw,40px)" }}>

          {/* バッジ */}
          <div style={{ marginBottom: 36 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#E2F2EE",
              color: "#5A8A7A",
              padding: "8px 20px",
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7ABCAA", display: "inline-block" }}/>
              子どもの今を、言葉に。
            </span>
          </div>

          {/* タイトル */}
          <h1 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 700,
            fontSize: "clamp(48px, 6.5vw, 84px)",
            lineHeight: 1.3,
            color: "#3A3A3A",
            marginBottom: 32,
            letterSpacing: "-0.01em",
          }}>
            先週のメモが、<br />
            <span style={{ color: "#FFB7B2" }}>週案になる。</span>
          </h1>

          {/* サブコピー */}
          <p style={{
            fontSize: "clamp(15px, 1.7vw, 17px)",
            color: "#7A7A7A",
            lineHeight: 2.0,
            maxWidth: 540,
            margin: "0 auto 48px",
          }}>
            「今日、○○ちゃんが転んで泣いた」——そのメモで十分。<br />
            AIが保育指針に沿った週案を自動で仕上げます。
          </p>

          {/* CTA ボタン */}
          <div style={{ marginBottom: 16 }}>
            <Link
              href="/login"
              style={{
                background: "#FFB7B2",
                color: "white",
                padding: "18px 52px",
                borderRadius: 50,
                fontSize: 18,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 6px 24px rgba(255,183,178,0.45)",
                letterSpacing: "0.02em",
              }}
            >
              無料で始める
              <span style={{ fontSize: 20 }}>→</span>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "#B0A0A0", marginBottom: 64 }}>登録無料・クレジットカード不要</p>

          {/* ステップ */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            {[
              { step: "1", text: "様子をメモ" },
              { step: "2", text: "AIが週案に変換" },
              { step: "3", text: "すぐ提出" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 96 }}>
                  <span style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: 36,
                    color: "#FFCDCB",
                    lineHeight: 1,
                    marginBottom: 6,
                    fontWeight: 700,
                  }}>
                    {item.step}
                  </span>
                  <span style={{ fontSize: 13, color: "#9A8A8A", whiteSpace: "nowrap" }}>{item.text}</span>
                </div>
                {i < 2 && (
                  <span style={{ color: "#D8CECE", fontSize: 22, flexShrink: 0, marginBottom: 24 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* アプリUI プレビューカード */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 clamp(16px,4vw,40px) clamp(60px,8vw,100px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: 24,
            boxShadow: "0 8px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(255,183,178,0.12)",
            border: "1px solid rgba(255,255,255,0.9)",
            overflow: "hidden",
          }}>
            {/* ウィンドウバー */}
            <div style={{
              background: "rgba(255,183,178,0.08)",
              borderBottom: "1px solid rgba(255,183,178,0.15)",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFCDCB" }}/>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFE4B2" }}/>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#D1E8E2" }}/>
              <span style={{ marginLeft: 8, fontSize: 12, color: "#B4A494", letterSpacing: "0.05em" }}>ことのは — AIアシスタント</span>
            </div>

            <div className="preview-card-grid" style={{ minHeight: 280 }}>
              {/* 左：チャット */}
              <div className="preview-card-left" style={{ padding: "24px 28px", borderRight: "1px solid rgba(255,183,178,0.12)" }}>
                <p style={{ fontSize: 11, color: "#C4B4A4", marginBottom: 18, letterSpacing: "0.06em", fontWeight: 600 }}>AIとの対話</p>

                <div style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#4A4A4A",
                  lineHeight: 1.75,
                  marginBottom: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  先週、子どもたちはどんな遊びや活動をしていましたか？印象に残った場面を教えてください。
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <div style={{
                    background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#fff",
                    lineHeight: 1.75,
                    maxWidth: "82%",
                    boxShadow: "0 2px 8px rgba(255,183,178,0.3)",
                  }}>
                    砂場で水遊びを楽しんでいました。友達と山を作ったり、川を作ったりしていました。
                  </div>
                </div>

                <div style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#4A4A4A",
                  lineHeight: 1.75,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  素敵な場面ですね。そのとき子どもたちはどんな言葉をかけ合っていましたか？
                </div>
              </div>

              {/* 右：週案プレビュー */}
              <div style={{ padding: "28px 32px" }}>
                <p style={{ fontSize: 11, color: "#C4B4A4", marginBottom: 18, letterSpacing: "0.06em", fontWeight: 600 }}>生成された週案</p>

                {[
                  {
                    label: "前週の子どもの姿",
                    color: "#FFB7B2",
                    content: "・砂と水を合わせて山や川を作るなど、友だちとイメージを共有しながら遊ぶ姿が見られた",
                  },
                  {
                    label: "今週のねらい",
                    color: "#B2E2F2",
                    content: "・友だちと力を合わせながら、共通のイメージを持って遊ぶことを楽しむ",
                  },
                  {
                    label: "保育士の援助",
                    color: "#D1E8E2",
                    content: "・子どもの言葉に耳を傾け、気持ちを代弁しながら関わりを見守る",
                  },
                ].map((item, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#6A5A4A", letterSpacing: "0.04em" }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#7A7A7A", lineHeight: 1.8, paddingLeft: 14 }}>{item.content}</p>
                  </div>
                ))}

                <div style={{
                  marginTop: 20,
                  padding: "10px 16px",
                  background: "linear-gradient(135deg, rgba(255,183,178,0.15), rgba(255,205,202,0.15))",
                  border: "1px solid rgba(255,183,178,0.3)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#B07070",
                  textAlign: "center",
                }}>
                  週案が完成しました ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 clamp(16px,4vw,40px) clamp(60px,8vw,120px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{
            textAlign: "center",
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(20px, 2.6vw, 28px)",
            fontWeight: 700,
            color: "#4A4A4A",
            marginBottom: 48,
            letterSpacing: "0.04em",
          }}>
            保育士さんの「ちょうどいい」を目指して
          </p>
          <div className="features-grid">
            {[
              {
                icon: <GuidanceIcon />,
                color: "#FFB7B2",
                bg: "rgba(255,183,178,0.1)",
                title: "保育指針に準拠",
                desc: "ねらい・内容・環境・援助を自動で構成。指導計画として使えるクオリティで出力します。",
              },
              {
                icon: <FormatIcon />,
                color: "#B2E2F2",
                bg: "rgba(178,226,242,0.12)",
                title: "各園フォーマット対応",
                desc: "施設タイプ・クラスに合わせた書式を設定。自分の園の週案にそのまま使えます。",
              },
              {
                icon: <ChatIcon />,
                color: "#D1E8E2",
                bg: "rgba(209,232,226,0.15)",
                title: "AIと対話しながら作成",
                desc: "週の様子を話すだけでAIが項目を埋めていきます。難しい言葉は一切不要です。",
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderRadius: 20,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(255,255,255,0.85)",
                  padding: "36px 32px",
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  background: f.bg,
                  border: `1px solid ${f.color}40`,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 22,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 17, marginBottom: 12, color: "#4A4A4A" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "#7A7A7A" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px 40px 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Noto Serif JP', serif",
            fontWeight: 700,
            fontSize: "clamp(26px, 3.2vw, 38px)",
            color: "#4A4A4A",
            marginBottom: 20,
            lineHeight: 1.5,
          }}>
            今日の記録が、<br />明日の保育になる。
          </h2>
          <p style={{ fontSize: 15, color: "#9A8A8A", marginBottom: 36, lineHeight: 1.8 }}>
            まずは無料で試してみてください。
          </p>
          <Link
            href="/login"
            style={{
              background: "#FFB7B2",
              color: "white",
              padding: "18px 52px",
              borderRadius: 50,
              fontSize: 17,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 6px 20px rgba(255,183,178,0.45)",
            }}
          >
            無料で始める →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, background: "#384D48", color: "white", padding: "48px 40px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <LeafLogo />
          <span style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: 16, letterSpacing: "0.1em" }}>ことのは</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
          今日も一日、お疲れ様でした
        </p>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFB7B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7ABCCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7ABCAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="12" y2="13"/>
    </svg>
  );
}
