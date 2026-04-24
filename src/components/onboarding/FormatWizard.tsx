"use client";

import { useState, useTransition } from "react";
import { FIELD_DEFINITIONS, FACILITY_PRESETS, LAYOUT_OPTIONS, FACILITY_LABELS } from "@/lib/format-definitions";
import type { FacilityType, LayoutType, FieldSlug, FieldLayoutItem } from "@/lib/format-definitions";
import { saveFormatConfig, updateFormatConfig } from "@/app/actions/format-config";
import { FormatLayoutEditor } from "./FormatLayoutEditor";

const FACILITY_CARDS: { type: FacilityType; label: string; sub: string; color: string }[] = [
  { type: "nursery_infant",    label: "保育所（0〜2歳）", sub: "乳児クラス担当",   color: "#FFB7B2" },
  { type: "nursery_preschool", label: "保育所（3〜5歳）", sub: "幼児クラス担当",   color: "#B2E2F2" },
  { type: "kindergarten",      label: "幼稚園",           sub: "幼稚園勤務",       color: "#D1E8E2" },
  { type: "combined",          label: "認定こども園",     sub: "こども園勤務",     color: "#FFE4B2" },
];

const A_SLUGS = Object.values(FIELD_DEFINITIONS).filter(d => d.group === "A").map(d => d.slug);

export interface FormatWizardInitialConfig {
  facilityType: FacilityType;
  layoutType: LayoutType;
  activeFields: FieldSlug[];
  fieldLayout: FieldLayoutItem[];
}

interface Props {
  mode?: "onboarding" | "settings";
  initialConfig?: FormatWizardInitialConfig;
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FormatWizard({ mode = "onboarding", initialConfig }: Props) {
  const [step, setStep] = useState(1);
  const [facilityType, setFacilityType] = useState<FacilityType | null>(initialConfig?.facilityType ?? null);
  const [activeFields, setActiveFields] = useState<Set<FieldSlug>>(
    new Set(initialConfig?.activeFields ?? [])
  );
  const [layoutType, setLayoutType] = useState<LayoutType>(initialConfig?.layoutType ?? "vertical");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFacilitySelect = (type: FacilityType) => {
    setFacilityType(type);
    setActiveFields(new Set(FACILITY_PRESETS[type].defaultFields));
    setStep(2);
  };

  const toggleField = (slug: FieldSlug) => {
    const def = FIELD_DEFINITIONS[slug];
    if (def.group === "A") return;
    setActiveFields(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleLayoutSave = (fieldLayout: FieldLayoutItem[]) => {
    if (!facilityType) return;
    const allFields = [...new Set([...A_SLUGS, ...Array.from(activeFields)])] as FieldSlug[];
    startTransition(async () => {
      if (mode === "settings") {
        await updateFormatConfig({ facilityType, layoutType, activeFields: allFields, fieldLayout });
        setSaved(true);
      } else {
        await saveFormatConfig({ facilityType, layoutType, activeFields: allFields, fieldLayout });
      }
    });
  };

  const groupedFields = facilityType ? {
    B: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "B"),
    C: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "C"),
    D: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "D" && d.defaultFor.includes(facilityType)),
  } : null;

  const stepLabels = ["施設タイプ", "項目選択", "レイアウト", "並び・幅"];

  // Success state (settings mode only)
  if (saved) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(209,232,226,0.4)" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M6 14L11 19L22 8" stroke="#7ABCAA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="font-serif-jp font-bold text-base" style={{ color: "#4A4A4A" }}>保存しました</p>
        <p className="text-sm" style={{ color: "#B4A494" }}>フォーマット設定が更新されました</p>
        <button
          onClick={() => { setSaved(false); setStep(1); }}
          className="text-xs px-4 py-2 rounded-xl cursor-pointer transition-all"
          style={{ background: "rgba(255,183,178,0.15)", color: "#C07060", border: "1px solid rgba(255,183,178,0.3)" }}
        >
          もう一度変更する
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step >= s ? "linear-gradient(135deg, #FFB7B2, #ffcac6)" : "rgba(255,183,178,0.15)",
                color: step >= s ? "#4A4A4A" : "#C4B4A4",
                boxShadow: step >= s ? "0 2px 8px rgba(255,183,178,0.35)" : "none",
              }}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className="h-0.5 w-6 rounded-full transition-all"
                style={{ background: step > s ? "#FFB7B2" : "rgba(255,183,178,0.2)" }}
              />
            )}
          </div>
        ))}
        <span className="text-xs ml-2" style={{ color: "#B4A494" }}>
          {stepLabels[step - 1]}
        </span>
      </div>

      {/* Step 1: Facility type */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-center" style={{ color: "#9A8878" }}>あなたの園の種別を選んでください</p>
          {facilityType && (
            <div className="text-xs text-center py-1.5 px-3 rounded-xl mx-auto w-fit" style={{ background: "rgba(255,183,178,0.12)", color: "#C07060" }}>
              現在：{FACILITY_LABELS[facilityType]}
            </div>
          )}
          {FACILITY_CARDS.map(card => (
            <button
              key={card.type}
              onClick={() => handleFacilitySelect(card.type)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer"
              style={{
                background: facilityType === card.type ? `${card.color}18` : "rgba(255,255,255,0.6)",
                borderColor: facilityType === card.type ? card.color : "rgba(255,255,255,0.88)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = card.color;
                (e.currentTarget as HTMLElement).style.background = `${card.color}18`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = facilityType === card.type ? card.color : "rgba(255,255,255,0.88)";
                (e.currentTarget as HTMLElement).style.background = facilityType === card.type ? `${card.color}18` : "rgba(255,255,255,0.6)";
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${card.color}30` }}>
                <FacilityDot color={card.color} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#4A4A4A" }}>{card.label}</p>
                <p className="text-xs" style={{ color: "#B4A494" }}>{card.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Field selection */}
      {step === 2 && groupedFields && (
        <div className="space-y-5">
          <p className="text-sm text-center" style={{ color: "#9A8878" }}>週案に含める項目を選んでください</p>

          <div>
            <p className="text-xs font-medium mb-2 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.06em" }}>ヘッダー（固定・変更不可）</p>
            <div className="space-y-1">
              {Object.values(FIELD_DEFINITIONS).filter(d => d.group === "A").map(d => (
                <div key={d.slug} className="flex items-center gap-3 py-2 px-3 rounded-xl opacity-50" style={{ background: "rgba(209,232,226,0.2)" }}>
                  <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#D1E8E2" }}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3 5.5L8 1" stroke="#6A9A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xs" style={{ color: "#7A8A7A" }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {[
            { fields: groupedFields.B, label: "基本項目（推奨・ON）", color: "#FFB7B2" },
            { fields: groupedFields.C, label: "追加項目（任意・OFF）", color: "#B2E2F2" },
            ...(groupedFields.D.length > 0 ? [{ fields: groupedFields.D, label: "施設タイプ固有（推奨・ON）", color: "#D1E8E2" }] : []),
          ].map(({ fields, label, color }) => (
            <div key={label}>
              <p className="text-xs font-medium mb-2 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.06em" }}>{label}</p>
              <div className="space-y-1">
                {fields.map(d => (
                  <button
                    key={d.slug}
                    onClick={() => toggleField(d.slug)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border transition-all cursor-pointer text-left"
                    style={{
                      background: activeFields.has(d.slug) ? `${color}18` : "rgba(255,255,255,0.5)",
                      borderColor: activeFields.has(d.slug) ? `${color}60` : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: activeFields.has(d.slug) ? color : "rgba(255,255,255,0.6)",
                        border: `1.5px solid ${activeFields.has(d.slug) ? color : "rgba(200,190,180,0.5)"}`,
                      }}
                    >
                      {activeFields.has(d.slug) && <CheckIcon />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium" style={{ color: "#4A4A4A" }}>{d.label}</p>
                      <p className="text-xs" style={{ color: "#B4A494" }}>{d.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl text-sm transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.6)", color: "#9A8878", border: "1px solid rgba(255,255,255,0.8)" }}>
              戻る
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer" style={{ background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A", boxShadow: "0 2px 12px rgba(255,183,178,0.35)" }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Layout type */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-center" style={{ color: "#9A8878" }}>週案のレイアウト形式を選んでください</p>
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLayoutType(opt.value)}
              className="w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer"
              style={{
                background: layoutType === opt.value ? "rgba(255,183,178,0.12)" : "rgba(255,255,255,0.55)",
                borderColor: layoutType === opt.value ? "#FFB7B2" : "rgba(255,255,255,0.8)",
              }}
            >
              <div className="w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all" style={{ borderColor: layoutType === opt.value ? "#FFB7B2" : "rgba(200,190,180,0.6)" }}>
                {layoutType === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FFB7B2" }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#4A4A4A" }}>{opt.label}</p>
                <p className="text-xs" style={{ color: "#B4A494" }}>{opt.description}</p>
              </div>
            </button>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl text-sm transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.6)", color: "#9A8878", border: "1px solid rgba(255,255,255,0.8)" }}>
              戻る
            </button>
            <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer" style={{ background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A", boxShadow: "0 2px 12px rgba(255,183,178,0.35)" }}>
              次へ
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Visual layout editor */}
      {step === 4 && facilityType && (
        <div className="space-y-4">
          <FormatLayoutEditor
            activeFields={[...new Set([...A_SLUGS, ...Array.from(activeFields)])] as FieldSlug[]}
            initialLayout={initialConfig?.fieldLayout}
            onSave={handleLayoutSave}
            saving={isPending}
            saveLabel={mode === "settings" ? "変更を保存する" : "設定を完了する"}
          />
          <button onClick={() => setStep(3)} className="w-full py-2.5 rounded-2xl text-sm transition-all cursor-pointer" style={{ background: "rgba(255,255,255,0.6)", color: "#9A8878", border: "1px solid rgba(255,255,255,0.8)" }}>
            戻る
          </button>
        </div>
      )}
    </div>
  );
}

function FacilityDot({ color }: { color: string }) {
  return <div className="w-4 h-4 rounded-full" style={{ background: color, opacity: 0.75 }} />;
}
