"use client"

import { useState, useTransition } from "react"
import { FIELD_DEFINITIONS, FACILITY_PRESETS, LAYOUT_OPTIONS } from "@/lib/format-definitions"
import type { FacilityType, LayoutType, FieldSlug } from "@/lib/format-definitions"
import { saveFormatConfig } from "@/app/actions/format-config"

const FACILITY_CARDS: { type: FacilityType; label: string; sub: string }[] = [
  { type: "nursery_infant",    label: "保育所（0〜2歳）", sub: "乳児クラス担当" },
  { type: "nursery_preschool", label: "保育所（3〜5歳）", sub: "幼児クラス担当" },
  { type: "kindergarten",      label: "幼稚園",           sub: "幼稚園勤務" },
  { type: "combined",          label: "認定こども園",     sub: "こども園勤務" },
]

const A_SLUGS = Object.values(FIELD_DEFINITIONS).filter(d => d.group === "A").map(d => d.slug)

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function FormatWizard() {
  const [step, setStep] = useState(1)
  const [facilityType, setFacilityType] = useState<FacilityType | null>(null)
  const [activeFields, setActiveFields] = useState<Set<FieldSlug>>(new Set())
  const [layoutType, setLayoutType] = useState<LayoutType>("vertical")
  const [isPending, startTransition] = useTransition()

  const handleFacilitySelect = (type: FacilityType) => {
    setFacilityType(type)
    setActiveFields(new Set(FACILITY_PRESETS[type].defaultFields))
    setStep(2)
  }

  const toggleField = (slug: FieldSlug) => {
    const def = FIELD_DEFINITIONS[slug]
    if (def.group === "A") return
    setActiveFields(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const handleSubmit = () => {
    if (!facilityType) return
    const allFields = [...new Set([...A_SLUGS, ...Array.from(activeFields)])] as FieldSlug[]
    startTransition(async () => {
      await saveFormatConfig({ facilityType, layoutType, activeFields: allFields })
    })
  }

  const groupedFields = facilityType ? {
    B: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "B"),
    C: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "C"),
    D: Object.values(FIELD_DEFINITIONS).filter(d => d.group === "D" && d.defaultFor.includes(facilityType)),
  } : null

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= s ? "bg-[#3d2b1f] text-[#f5f0e8]" : "bg-[#ece4d4] text-[#b09070]"
            }`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-8 ${step > s ? "bg-[#3d2b1f]" : "bg-[#ece4d4]"}`} />}
          </div>
        ))}
        <span className="text-xs text-[#b09070] ml-2">
          {step === 1 ? "施設タイプ" : step === 2 ? "項目選択" : "レイアウト"}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-[#8a6a50]">あなたの園の種別を選んでください</p>
          {FACILITY_CARDS.map(card => (
            <button
              key={card.type}
              onClick={() => handleFacilitySelect(card.type)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#ddd0b8] hover:border-[#d4845a] hover:bg-[#faf8f3] transition-all text-left cursor-pointer"
            >
              <div>
                <p className="text-sm font-bold text-[#3d2b1f]">{card.label}</p>
                <p className="text-xs text-[#b09070]">{card.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && groupedFields && (
        <div className="space-y-5">
          <p className="text-sm text-[#8a6a50]">週案に含める項目を選んでください</p>

          {/* A group fixed */}
          <div>
            <p className="text-xs font-bold text-[#b09070] mb-2">ヘッダー（固定・変更不可）</p>
            <div className="space-y-1">
              {Object.values(FIELD_DEFINITIONS).filter(d => d.group === "A").map(d => (
                <div key={d.slug} className="flex items-center gap-3 py-2 px-3 bg-[#f5f0e8] rounded-lg opacity-60">
                  <div className="w-4 h-4 rounded bg-[#3d2b1f] flex items-center justify-center flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span className="text-sm text-[#3d2b1f]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B group */}
          <div>
            <p className="text-xs font-bold text-[#b09070] mb-2">基本項目（推奨・ON）</p>
            <div className="space-y-1">
              {groupedFields.B.map(d => (
                <button
                  key={d.slug}
                  onClick={() => toggleField(d.slug)}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all cursor-pointer text-left ${
                    activeFields.has(d.slug) ? "border-[#3d2b1f] bg-[#f5f0e8]" : "border-[#ece4d4] bg-white"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    activeFields.has(d.slug) ? "border-[#3d2b1f] bg-[#3d2b1f]" : "border-[#ddd0b8]"
                  }`}>
                    {activeFields.has(d.slug) && <CheckIcon />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[#3d2b1f] font-medium">{d.label}</p>
                    <p className="text-xs text-[#b09070]">{d.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* C group */}
          <div>
            <p className="text-xs font-bold text-[#b09070] mb-2">追加項目（任意・OFF）</p>
            <div className="space-y-1">
              {groupedFields.C.map(d => (
                <button
                  key={d.slug}
                  onClick={() => toggleField(d.slug)}
                  className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all cursor-pointer text-left ${
                    activeFields.has(d.slug) ? "border-[#3d2b1f] bg-[#f5f0e8]" : "border-[#ece4d4] bg-white"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    activeFields.has(d.slug) ? "border-[#3d2b1f] bg-[#3d2b1f]" : "border-[#ddd0b8]"
                  }`}>
                    {activeFields.has(d.slug) && <CheckIcon />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[#3d2b1f] font-medium">{d.label}</p>
                    <p className="text-xs text-[#b09070]">{d.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* D group */}
          {groupedFields.D.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#b09070] mb-2">施設タイプ固有の項目（推奨・ON）</p>
              <div className="space-y-1">
                {groupedFields.D.map(d => (
                  <button
                    key={d.slug}
                    onClick={() => toggleField(d.slug)}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all cursor-pointer text-left ${
                      activeFields.has(d.slug) ? "border-[#d4845a] bg-[#fff8f0]" : "border-[#ece4d4] bg-white"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      activeFields.has(d.slug) ? "border-[#d4845a] bg-[#d4845a]" : "border-[#ddd0b8]"
                    }`}>
                      {activeFields.has(d.slug) && <CheckIcon />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-[#3d2b1f] font-medium">{d.label}</p>
                      <p className="text-xs text-[#b09070]">{d.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl border border-[#ddd0b8] text-[#8a6a50] text-sm hover:bg-[#faf8f3] transition-colors cursor-pointer"
            >
              戻る
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl bg-[#3d2b1f] text-[#f5f0e8] font-bold text-sm hover:bg-[#5c3d2e] transition-colors cursor-pointer"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-[#8a6a50]">週案のレイアウト形式を選んでください</p>
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLayoutType(opt.value)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                layoutType === opt.value
                  ? "border-[#3d2b1f] bg-[#f5f0e8]"
                  : "border-[#ddd0b8] hover:border-[#d4845a]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                layoutType === opt.value ? "border-[#3d2b1f]" : "border-[#ddd0b8]"
              }`}>
                {layoutType === opt.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3d2b1f]" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-[#3d2b1f]">{opt.label}</p>
                <p className="text-xs text-[#b09070]">{opt.description}</p>
              </div>
            </button>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 rounded-xl border border-[#ddd0b8] text-[#8a6a50] text-sm hover:bg-[#faf8f3] transition-colors cursor-pointer"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-[#3d2b1f] text-[#f5f0e8] font-bold text-sm hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "設定中..." : "設定を完了する"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
