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
          <div style={{ position: "relative", width: 500, height: 430, flexShrink: 0 }}>
            <svg width="500" height="430" viewBox="0 0 500 430" fill="none" xmlns="http://www.w3.org/2000/svg">

              {/* ── Sun (top-right) ── */}
              <line x1="453" y1="20" x2="453" y2="10" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="477" y1="28" x2="485" y2="20" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="485" y1="52" x2="495" y2="48" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="477" y1="76" x2="485" y2="84" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="429" y1="28" x2="421" y2="20" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="421" y1="52" x2="411" y2="48" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="429" y1="76" x2="421" y2="84" stroke="#FFDB36" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="453" cy="52" r="28" fill="#FFE868" stroke="#FFD040" strokeWidth="0.8"/>
              <ellipse cx="444" cy="46" rx="3" ry="3.5" fill="#5A4015"/>
              <ellipse cx="462" cy="46" rx="3" ry="3.5" fill="#5A4015"/>
              <path d="M441 62 Q453 73 465 62" stroke="#5A4015" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="439" cy="60" r="5.5" fill="rgba(255,140,110,0.28)"/>
              <circle cx="467" cy="60" r="5.5" fill="rgba(255,140,110,0.28)"/>

              {/* ── Music notes (top-center) ── */}
              <path d="M248 35 L248 68 L243 70 C239 71 235 68 235 64 C235 60 238 57 243 57 L248 55 Z" fill="#A8CEF1"/>
              <path d="M248 35 L265 29 L265 62 L260 64 C256 65 252 62 252 58 C252 54 255 51 260 51 L265 49 Z" fill="#A8CEF1"/>
              <path d="M222 48 L222 73 L218 74 C214 75 211 72 211 69 C211 66 214 63 218 63 L222 61 Z" fill="#A8CEF1"/>
              <path d="M222 48 L236 43 L236 68 L232 69 C228 70 225 67 225 64 C225 61 228 58 232 58 L236 56 Z" fill="#A8CEF1"/>

              {/* ── Crayons (right side) ── */}
              <g transform="rotate(-22 462 192)">
                <rect x="430" y="184" width="62" height="14" rx="3" fill="#A8CEF1" stroke="#7AACD8" strokeWidth="0.7"/>
                <path d="M492 184 L502 191 L492 198 Z" fill="#7AACD8"/>
                <rect x="432" y="186" width="56" height="10" rx="2" fill="rgba(255,255,255,0.35)"/>
              </g>
              <g transform="rotate(-10 462 215)">
                <rect x="434" y="208" width="58" height="13" rx="3" fill="#7EC8C0" stroke="#5ABAB0" strokeWidth="0.7"/>
                <path d="M492 208 L501 214.5 L492 221 Z" fill="#5ABAB0"/>
                <rect x="436" y="210" width="52" height="9" rx="2" fill="rgba(255,255,255,0.3)"/>
              </g>

              {/* ── Teacher figure ── */}

              {/* Sitting base / legs */}
              <ellipse cx="240" cy="312" rx="92" ry="26" fill="#6A9B94"/>

              {/* Body (sage green apron) */}
              <path d="M183 150 Q168 205 168 260 Q176 302 240 314 Q304 302 312 260 Q312 205 297 150 Z" fill="#8DC5B6"/>

              {/* White neckline */}
              <ellipse cx="240" cy="150" rx="38" ry="17" fill="#F5F0EB"/>

              {/* Cat face appliqué on apron */}
              <circle cx="240" cy="212" r="20" fill="white" stroke="#B8D8D0" strokeWidth="0.8"/>
              <path d="M227 198 L222 186 L233 194 Z" fill="white" stroke="#B8D8D0" strokeWidth="0.8"/>
              <path d="M253 198 L258 186 L247 194 Z" fill="white" stroke="#B8D8D0" strokeWidth="0.8"/>
              <path d="M227 197 L223 188 L232 194 Z" fill="#FFD0CC" opacity="0.55"/>
              <path d="M253 197 L257 188 L248 194 Z" fill="#FFD0CC" opacity="0.55"/>
              <path d="M233 210 Q237 206 241 210" stroke="#909090" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <path d="M239 210 Q243 206 247 210" stroke="#909090" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <circle cx="240" cy="216" r="2" fill="#FFB0B0"/>
              <path d="M237 220 Q240 224 243 220" stroke="#909090" strokeWidth="1" strokeLinecap="round" fill="none"/>
              <line x1="224" y1="216" x2="231" y2="217" stroke="#C0C0C0" strokeWidth="0.6"/>
              <line x1="224" y1="219" x2="231" y2="219" stroke="#C0C0C0" strokeWidth="0.6"/>
              <line x1="249" y1="217" x2="256" y2="216" stroke="#C0C0C0" strokeWidth="0.6"/>
              <line x1="249" y1="219" x2="256" y2="219" stroke="#C0C0C0" strokeWidth="0.6"/>

              {/* Left arm */}
              <path d="M183 198 Q152 236 150 274" stroke="#FFCBA4" strokeWidth="30" strokeLinecap="round" fill="none"/>
              <circle cx="149" cy="277" r="16" fill="#FFCBA4"/>

              {/* Right arm (reaching toward child) */}
              <path d="M297 198 Q336 232 350 272" stroke="#FFCBA4" strokeWidth="26" strokeLinecap="round" fill="none"/>
              <circle cx="353" cy="275" r="14" fill="#FFCBA4"/>

              {/* Neck */}
              <rect x="224" y="134" width="32" height="22" rx="11" fill="#FFCBA4"/>

              {/* Head */}
              <circle cx="240" cy="90" r="48" fill="#FFCBA4"/>

              {/* Hair — back top */}
              <path d="M195 78 Q206 28 240 26 Q274 28 285 78 Q282 56 280 47 Q262 8 240 6 Q218 8 200 47 Q198 56 195 78 Z" fill="#7A5030"/>
              {/* Hair — left side */}
              <path d="M195 78 Q189 106 192 143 Q202 156 214 150 Q205 125 204 98 Z" fill="#7A5030"/>
              {/* Hair — right side flowing to ponytail */}
              <path d="M285 78 Q291 106 288 143 Q278 156 266 150 Q275 125 276 98 Z" fill="#7A5030"/>
              {/* Ponytail */}
              <ellipse cx="293" cy="104" rx="15" ry="32" fill="#7A5030" transform="rotate(14 293 104)"/>
              {/* Hair tie */}
              <ellipse cx="288" cy="82" rx="9" ry="6" fill="#B07840" stroke="#906020" strokeWidth="0.7"/>

              {/* Eyes (happy closed arcs) */}
              <path d="M220 88 Q228 80 236 88" stroke="#5A3015" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M244 88 Q252 80 260 88" stroke="#5A3015" strokeWidth="3" strokeLinecap="round" fill="none"/>
              {/* Eyebrows */}
              <path d="M218 79 Q228 73 237 79" stroke="#8A5525" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <path d="M243 79 Q253 73 262 79" stroke="#8A5525" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              {/* Nose */}
              <path d="M236 106 Q240 110 244 106" stroke="#C09070" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              {/* Smile */}
              <path d="M220 118 Q240 132 260 118" stroke="#C07060" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              {/* Cheeks */}
              <circle cx="210" cy="114" r="13" fill="rgba(255,140,120,0.22)"/>
              <circle cx="270" cy="114" r="13" fill="rgba(255,140,120,0.22)"/>

              {/* ── Child figure ── */}

              {/* Child legs */}
              <ellipse cx="378" cy="298" rx="26" ry="15" fill="#C48860" transform="rotate(-12 378 298)"/>
              <ellipse cx="417" cy="295" rx="23" ry="14" fill="#C48860" transform="rotate(7 417 295)"/>

              {/* Child body (pink/salmon top) */}
              <path d="M366 276 Q356 244 371 228 Q383 215 398 215 Q413 215 425 228 Q438 244 430 276 Q416 294 398 292 Z" fill="#FFB5A8"/>

              {/* Child arm reaching for blocks */}
              <path d="M366 262 Q343 272 328 284" stroke="#FFCBA4" strokeWidth="24" strokeLinecap="round" fill="none"/>
              <circle cx="325" cy="286" r="13" fill="#FFCBA4"/>

              {/* Child neck */}
              <rect x="389" y="210" width="18" height="20" rx="8" fill="#FFCBA4"/>

              {/* Child head */}
              <circle cx="398" cy="180" r="34" fill="#FFCBA4"/>

              {/* Child hair (dark, short) */}
              <path d="M367 164 Q376 132 398 129 Q420 132 429 164 Q427 148 425 141 Q411 116 398 114 Q385 116 371 141 Q367 148 367 164 Z" fill="#4A2E10"/>
              <path d="M367 164 Q364 180 366 200 Q374 207 381 202 Q374 184 373 168 Z" fill="#4A2E10"/>
              <path d="M429 164 Q432 180 430 200 Q422 207 415 202 Q422 184 423 168 Z" fill="#4A2E10"/>

              {/* Child eyes (open, happy) */}
              <ellipse cx="387" cy="179" rx="4.5" ry="5.5" fill="#4A3010"/>
              <ellipse cx="409" cy="179" rx="4.5" ry="5.5" fill="#4A3010"/>
              <circle cx="388.5" cy="176.5" r="2" fill="white"/>
              <circle cx="410.5" cy="176.5" r="2" fill="white"/>
              {/* Child eyebrows */}
              <path d="M382 169 Q387 165 392 169" stroke="#7A5025" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M404 169 Q409 165 414 169" stroke="#7A5025" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              {/* Child nose */}
              <circle cx="398" cy="188" r="2" fill="#C09070"/>
              {/* Child big smile */}
              <path d="M383 198 Q398 213 413 198" stroke="#C07060" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              {/* Child cheeks */}
              <circle cx="374" cy="193" r="10" fill="rgba(255,140,120,0.25)"/>
              <circle cx="422" cy="193" r="10" fill="rgba(255,140,120,0.25)"/>

              {/* ── Building blocks ── */}

              {/* Large pink block (bottom) */}
              <rect x="288" y="280" width="46" height="46" rx="6" fill="#FFBDB8" stroke="#E8989A" strokeWidth="0.8"/>
              <line x1="288" y1="303" x2="334" y2="303" stroke="#E8989A" strokeWidth="0.6"/>
              <line x1="311" y1="280" x2="311" y2="326" stroke="#E8989A" strokeWidth="0.6"/>

              {/* Blue block (stacked on top, offset) */}
              <rect x="299" y="244" width="40" height="40" rx="6" fill="#A8CEF1" stroke="#7AACDF" strokeWidth="0.8"/>
              <line x1="299" y1="264" x2="339" y2="264" stroke="#7AACDF" strokeWidth="0.6"/>
              <line x1="319" y1="244" x2="319" y2="284" stroke="#7AACDF" strokeWidth="0.6"/>

              {/* Teal block (to the right on floor) */}
              <rect x="342" y="278" width="38" height="38" rx="6" fill="#7ECEC4" stroke="#58BAB0" strokeWidth="0.8"/>
              <line x1="342" y1="297" x2="380" y2="297" stroke="#58BAB0" strokeWidth="0.6"/>
              <line x1="361" y1="278" x2="361" y2="316" stroke="#58BAB0" strokeWidth="0.6"/>

              {/* ── Pink mat/blanket (bottom-right) ── */}
              <rect x="418" y="310" width="72" height="48" rx="13" fill="#FFB7B2" stroke="#E898A0" strokeWidth="0.8"/>
              <path d="M418 328 Q454 322 490 328" stroke="#E898A0" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
              <path d="M418 342 Q454 336 490 342" stroke="#E898A0" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
              <rect x="418" y="310" width="72" height="11" rx="11" fill="rgba(255,255,255,0.3)"/>

              {/* ── Plant / sprout ── */}
              <path d="M290 400 L290 356" stroke="#7DB880" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M290 368 Q310 356 314 366 Q310 376 290 372 Z" fill="#7DB880"/>
              <path d="M290 356 Q270 344 266 354 Q270 364 290 360 Z" fill="#9DC89E" opacity="0.85"/>
              <path d="M290 382 Q308 372 311 381 Q307 390 290 386 Z" fill="#9DC89E" opacity="0.7"/>

              {/* Floor shadow */}
              <ellipse cx="240" cy="328" rx="102" ry="10" fill="rgba(0,0,0,0.04)"/>
              <ellipse cx="415" cy="362" rx="76" ry="8" fill="rgba(0,0,0,0.03)"/>

            </svg>
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
