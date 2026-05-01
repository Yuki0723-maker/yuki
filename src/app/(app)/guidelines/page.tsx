"use client"

import { useState } from "react"
import {
  AGE_GUIDELINES, GO_RYOUIKI, HOIKU_MOKUHYO, GUIDELINE_CHAPTERS,
  JU_NO_SUGATA, REFERENCE_CATEGORIES,
  type AgeGroupGuideline,
} from "@/lib/hoiku-shishin"

const TABS = [
  { id: "overview",          label: "概要・目標" },
  { id: "ju_no_sugata",      label: "10の姿" },
  { id: "nursery_infant",    label: "0〜2歳" },
  { id: "nursery_preschool", label: "3〜5歳" },
  { id: "reference",         label: "参考文書" },
  { id: "chapters",          label: "目次" },
]

export default function GuidelinesPage() {
  const [activeTab, setActiveTab]     = useState("overview")
  const [openSection, setOpenSection] = useState<number | null>(null)
  const [openSugata, setOpenSugata]   = useState<number | null>(null)

  const ageGroups = AGE_GUIDELINES.filter(g =>
    activeTab === "nursery_infant"
      ? g.facilityTypes.includes("nursery_infant") && !g.facilityTypes.includes("nursery_preschool")
      : activeTab === "nursery_preschool"
      ? g.facilityTypes.includes("nursery_preschool")
      : false
  )

  return (
    <div style={{ minHeight: "100vh", background: "#FDF8F2", fontFamily: "'Zen Maru Gothic', sans-serif" }}>

      {/* ページヘッダー */}
      <div style={{ borderBottom: "1px solid rgba(255,183,178,0.2)", background: "rgba(255,255,255,0.8)", padding: "24px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,183,178,0.15)", border: "1px solid rgba(255,183,178,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookIcon />
          </div>
          <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 22, fontWeight: 700, color: "#3A3A3A", margin: 0 }}>
            保育所保育指針
          </h1>
          <span style={{ fontSize: 12, color: "#B0A090", background: "rgba(255,183,178,0.1)", border: "1px solid rgba(255,183,178,0.25)", padding: "3px 10px", borderRadius: 20 }}>
            平成29年告示
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#9A8A7A", margin: 0 }}>
          厚生労働省が定める保育所保育の基本指針。週案作成の参考資料としてご活用ください。
        </p>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 920, margin: "0 auto" }}>

        {/* タブ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOpenSection(null); setOpenSugata(null) }}
              style={{
                padding: "8px 18px",
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                border: activeTab === tab.id ? "1px solid rgba(255,183,178,0.5)" : "1px solid rgba(0,0,0,0.08)",
                background: activeTab === tab.id ? "rgba(255,183,178,0.15)" : "white",
                color: activeTab === tab.id ? "#B07870" : "#8A7A6A",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── 概要・目標 ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card title="保育の目標（第1章）" accentColor="#FFB7B2">
              <p style={{ fontSize: 13, color: "#7A6A5A", lineHeight: 1.8, marginBottom: 16 }}>
                子どもが現在を最もよく生き、望ましい未来をつくり出す力の基礎を培うことが保育の目標です。
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {HOIKU_MOKUHYO.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(255,183,178,0.2)", border: "1px solid rgba(255,183,178,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#B07870", fontWeight: 700 }}>
                      {["ア","イ","ウ","エ","オ","カ"][i]}
                    </span>
                    <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.75, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="保育の5領域" accentColor="#B2E2F2">
              <p style={{ fontSize: 13, color: "#7A6A5A", lineHeight: 1.8, marginBottom: 16 }}>
                3歳以上児は5領域を意識しながら保育を展開します。（3歳未満児は各領域を明確に区分せず総合的に展開）
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {GO_RYOUIKI.map((r, i) => {
                  const colors = ["#FFB7B2","#B2E2F2","#D1E8E2","#FFE4B2","#E8D1F2"]
                  return (
                    <div key={r.id} style={{ background: `${colors[i]}22`, border: `1px solid ${colors[i]}66`, borderRadius: 12, padding: "14px 16px" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#4A4A4A", marginBottom: 6, fontFamily: "'Noto Serif JP', serif" }}>{r.label}</p>
                      <p style={{ fontSize: 12, color: "#7A7A7A", lineHeight: 1.7, margin: 0 }}>{r.description}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* 10の姿への誘導 */}
            <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(209,232,226,0.4)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", margin: "0 0 4px" }}>幼児期の終わりまでに育てたい10の姿</p>
                <p style={{ fontSize: 12, color: "#9A8A7A", margin: 0 }}>就学前に育てたい10の姿と週案作成のヒント</p>
              </div>
              <button
                onClick={() => setActiveTab("ju_no_sugata")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D1E8E2", color: "#4A8070", padding: "10px 20px", borderRadius: 50, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                10の姿を見る →
              </button>
            </div>

            {/* 参考文書への誘導 */}
            <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,183,178,0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", margin: "0 0 4px" }}>公式文書・解説を読む</p>
                <p style={{ fontSize: 12, color: "#9A8A7A", margin: 0 }}>保育指針・教育要領・解説書などの公式PDFリンク集</p>
              </div>
              <button
                onClick={() => setActiveTab("reference")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFB7B2", color: "white", padding: "10px 20px", borderRadius: 50, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 2px 10px rgba(255,183,178,0.35)", whiteSpace: "nowrap" }}
              >
                参考文書を見る →
              </button>
            </div>
          </div>
        )}

        {/* ── 10の姿 ── */}
        {activeTab === "ju_no_sugata" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "rgba(209,232,226,0.2)", border: "1px solid rgba(160,210,185,0.3)", borderRadius: 14, padding: "16px 20px", marginBottom: 4 }}>
              <p style={{ fontSize: 13, color: "#5A8070", lineHeight: 1.8, margin: 0 }}>
                保育所保育指針・幼稚園教育要領・幼保連携型認定こども園教育・保育要領（平成29年告示）で共通して示された、<strong>小学校就学前までに育てたい子どもの姿</strong>です。到達目標ではなく、保育の方向性を示すものとして活用します。
              </p>
            </div>
            {JU_NO_SUGATA.map((s, i) => (
              <div key={s.no} style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(209,232,226,0.3)", borderRadius: 16, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenSugata(openSugata === i ? null : i)}
                  style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: "rgba(209,232,226,0.4)", border: "1px solid rgba(160,210,185,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif JP', serif", fontSize: 15, fontWeight: 700, color: "#4A8070" }}>
                      {s.no}
                    </span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#3A3A3A", margin: "0 0 2px", fontFamily: "'Noto Serif JP', serif" }}>{s.name}</p>
                      <span style={{ fontSize: 11, color: "#7ABCAA", background: "rgba(122,188,170,0.12)", border: "1px solid rgba(122,188,170,0.3)", padding: "2px 8px", borderRadius: 10 }}>{s.keyword}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: "#C4A898", transform: openSugata === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>▾</span>
                </button>

                {openSugata === i && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(209,232,226,0.3)" }}>
                    <div style={{ marginTop: 16, marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#5A8070", margin: "0 0 8px", letterSpacing: "0.04em" }}>定義</p>
                      <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.85, margin: 0 }}>{s.description}</p>
                    </div>
                    <div style={{ background: "rgba(209,232,226,0.15)", border: "1px solid rgba(160,210,185,0.25)", borderRadius: 10, padding: "14px 16px" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#5A8070", margin: "0 0 10px", letterSpacing: "0.04em" }}>週案作成のヒント</p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {s.weeklyPlanTips.map((tip, j) => (
                          <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: "#7ABCAA", marginTop: 7 }}/>
                            <span style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.75 }}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 年齢別 ── */}
        {(activeTab === "nursery_infant" || activeTab === "nursery_preschool") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ageGroups.map((g, i) => (
              <AgeGroupCard
                key={g.ageGroup}
                guideline={g}
                isOpen={openSection === i}
                onToggle={() => setOpenSection(openSection === i ? null : i)}
              />
            ))}
          </div>
        )}

        {/* ── 参考文書 ── */}
        {activeTab === "reference" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ fontSize: 13, color: "#9A8A7A", margin: 0, lineHeight: 1.8 }}>
              保育所保育指針・幼稚園教育要領などの公式文書と解説書へのリンクです。各リンクは外部サイト（PDF）が開きます。
            </p>
            {REFERENCE_CATEGORIES.map((cat) => (
              <div key={cat.category} style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,183,178,0.18)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "14px 22px", borderBottom: `1px solid ${cat.color}40`, background: `${cat.color}12`, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 4, height: 18, borderRadius: 2, background: cat.color }}/>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#4A4A4A", margin: 0, fontFamily: "'Noto Serif JP', serif" }}>{cat.category}</p>
                </div>
                <div style={{ padding: "4px 16px" }}>
                  {cat.links.map((link, j) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 8px", borderBottom: j < cat.links.length - 1 ? "1px solid rgba(255,183,178,0.1)" : "none", textDecoration: "none", gap: 12 }}
                    >
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", margin: "0 0 3px" }}>{link.label}</p>
                        <p style={{ fontSize: 12, color: "#9A8A7A", margin: 0 }}>{link.sub}</p>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: 13, color: "#B07870", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        開く
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 目次 ── */}
        {activeTab === "chapters" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GUIDELINE_CHAPTERS.map(c => (
              <div
                key={c.chapter}
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,183,178,0.15)", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "rgba(255,183,178,0.12)", border: "1px solid rgba(255,183,178,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Serif JP', serif", fontSize: 13, fontWeight: 700, color: "#B07870" }}>
                  {c.chapter}
                </span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#4A4A4A", margin: "0 0 4px" }}>第{c.chapter}章 {c.title}</p>
                  <p style={{ fontSize: 12, color: "#9A8A7A", margin: 0 }}>{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AgeGroupCard({ guideline, isOpen, onToggle }: { guideline: AgeGroupGuideline; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,183,178,0.18)", borderRadius: 16, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,183,178,0.12)", border: "1px solid rgba(255,183,178,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#B07870", fontWeight: 700 }}>
            {guideline.chapter}章
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#3A3A3A", margin: 0, fontFamily: "'Noto Serif JP', serif" }}>{guideline.ageGroup}</p>
            <p style={{ fontSize: 12, color: "#9A8A7A", margin: 0 }}>{guideline.ageRange} / {guideline.developmentFeatures.slice(0, 30)}…</p>
          </div>
        </div>
        <span style={{ fontSize: 18, color: "#C4A898", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
      </button>

      {isOpen && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid rgba(255,183,178,0.12)" }}>
          <Section title="発達の主な特徴" color="#FFB7B2">
            <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.8, margin: 0 }}>{guideline.developmentFeatures}</p>
          </Section>
          <Section title="保育士の姿勢と関わりの視点" color="#B2E2F2">
            <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.8, margin: 0 }}>{guideline.teacherStance}</p>
          </Section>
          <Section title="ねらい" color="#D1E8E2">
            <BulletList items={guideline.goals} dotColor="#D1E8E2" dotBorder="#9EC8BC" />
          </Section>
          <Section title="内容" color="#FFE4B2">
            <BulletList items={guideline.contentItems} dotColor="#FFE4B2" dotBorder="#F0C878" />
          </Section>
          <Section title="主な配慮事項" color="#F2D1E8" last>
            <BulletList items={guideline.considerations} dotColor="#F2D1E8" dotBorder="#D898C0" />
          </Section>
        </div>
      )}
    </div>
  )
}

function BulletList({ items, dotColor, dotBorder }: { items: string[]; dotColor: string; dotBorder: string }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: dotColor, border: `1px solid ${dotBorder}`, marginTop: 7 }}/>
          <span style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Card({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,183,178,0.18)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 22px", borderBottom: `1px solid ${accentColor}30`, background: `${accentColor}10`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: accentColor }}/>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#4A4A4A", margin: 0, fontFamily: "'Noto Serif JP', serif" }}>{title}</p>
      </div>
      <div style={{ padding: "18px 22px" }}>{children}</div>
    </div>
  )
}

function Section({ title, color, children, last }: { title: string; color: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginTop: 18, paddingBottom: last ? 0 : 18, borderBottom: last ? "none" : "1px solid rgba(255,183,178,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }}/>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#6A5A4A", margin: 0, letterSpacing: "0.04em" }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B07870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  )
}
