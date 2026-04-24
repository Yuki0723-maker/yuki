"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FIELD_DEFINITIONS } from "@/lib/format-definitions";
import type { FieldSlug } from "@/lib/format-definitions";
import { updateWeeklyPlanFields, finalizePlan } from "@/app/actions/weekly-plan";
import { useRouter } from "next/navigation";

interface Props {
  planId: string;
  activeFields: FieldSlug[];
}

interface Message {
  role: "user" | "assistant" | "focus";
  content: string;
  slug?: FieldSlug;
}

const HEADER_FIELDS: FieldSlug[] = [
  "class_name", "week_date", "teacher_name", "enrollment_count", "month_plan_week",
];

// Field-specific prompts sent to AI when a field is focused
const FIELD_FOCUS_PROMPTS: Partial<Record<FieldSlug, string>> = {
  prev_week_observation: "「前週の子どもの姿」を書きたいです。先週、子どもたちはどんな様子でしたか？気になったことや印象的な場面を教えてください。",
  weekly_goal:           "「今週のねらい」を一緒に考えたいです。先週の子どもの姿をふまえて、今週大切にしたいことは何ですか？",
  activities:            "「活動内容」を計画したいです。今週どんな遊びや体験を予定していますか？",
  child_behavior_prediction: "「予想される子どもの姿」を考えたいです。活動の中で子どもたちはどんな反応や行動をしそうですか？",
  teacher_support:       "「保育者の援助・関わり」を考えたいです。子どもたちにどんなふうに関わりたいですか？特に気をつけたいことはありますか？",
  environment_setup:     "「環境構成」を考えたいです。今週の活動に向けて、どんな空間や素材・道具を準備しますか？",
  individual_care:       "「個別配慮」を書きたいです。特に気になっている子どもや、個別に対応が必要な子はいますか？",
  health_safety:         "「健康・安全配慮」を考えたいです。今週特に気をつけたい健康面や安全面はありますか？",
  food_education:        "「食育・給食」について書きたいです。今週の食の体験やマナー指導で大切にしたいことを教えてください。",
  family_community:      "「家庭・地域連携」を考えたいです。今週保護者に伝えたいことや地域との関わりはありますか？",
  weather_contingency:   "「天候・雨天対応」を考えたいです。戸外活動ができない場合の代替案を一緒に考えましょう。",
  weekly_reflection:     "「週の反省・評価」を書きたいです。今週を振り返ってどうでしたか？うまくいったことや課題を教えてください。",
  five_domains:          "「保育の5領域」を整理したいです。今週の活動と5領域（健康・人間関係・環境・言葉・表現）の関連を考えましょう。",
  sleep_feeding_record:  "「睡眠・授乳・おむつ記録」を計画したいです。今週の乳児の生活リズムについて教えてください。",
  individual_development:"「個別月齢発達記録」を書きたいです。子どもたちの月齢ごとの発達の様子を教えてください。",
  parent_communication:  "「保護者との連絡帳連携」を考えたいです。今週連絡帳で伝えたいことはありますか？",
  allergy_response:      "「離乳食・アレルギー対応」を確認したいです。今週の食事対応で注意が必要なことを教えてください。",
  duty_activities:       "「当番活動・係活動」を計画したいです。今週クラスの役割活動はどんな内容を予定していますか？",
  group_play:            "「ルール遊び・集団活動」を考えたいです。今週集団で楽しめるゲームや活動を一緒に考えましょう。",
  nap_record:            "「午睡の有無と記録」を考えたいです。今週の午睡の計画を教えてください。",
  school_readiness:      "「就学前準備」を計画したいです。小学校へのつながりを意識した今週の取り組みを考えましょう。",
  structured_free_play:  "「課業・自由遊びの区分」を考えたいです。今週の設定保育と自由遊びのバランスを教えてください。",
  subject_goals:         "「教科・領域別ねらい」を整理したいです。今週各領域でどんなことを大切にしたいですか？",
  parent_newsletter:     "「保護者向け連絡事項」を考えたいです。今週クラスだよりや連絡で伝えたいことはありますか？",
  extended_care:         "「預かり保育対応」を計画したいです。今週の預かり保育でどんな活動を予定していますか？",
};

function parseProposal(content: string): { fieldLabel: string; text: string } | null {
  const match = content.match(/---提案---\n【(.+?)】\n([\s\S]+?)\n----------/);
  if (!match) return null;
  return { fieldLabel: match[1], text: match[2].trim() };
}

function findSlugByLabel(label: string): FieldSlug | null {
  const entry = Object.entries(FIELD_DEFINITIONS).find(([, def]) => def.label === label);
  return entry ? (entry[0] as FieldSlug) : null;
}

function stripProposal(content: string): string {
  return content.replace(/---提案---[\s\S]*?----------/g, "").trim();
}

export function WeeklyPlanEditor({ planId, activeFields }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [focusedField, setFocusedField] = useState<FieldSlug | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scheduleAutoSave = useCallback(
    (newFields: Record<string, string>) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        await updateWeeklyPlanFields(planId, newFields);
      }, 500);
    },
    [planId]
  );

  const handleFieldChange = (slug: string, value: string) => {
    const updated = { ...fields, [slug]: value };
    setFields(updated);
    scheduleAutoSave(updated);
  };

  // Convert "focus" messages to "user" for API payload
  const toApiMessages = (msgs: Message[]) =>
    msgs
      .filter(m => m.role !== "focus" || m.content)
      .map(m => ({ role: m.role === "focus" ? "user" : m.role, content: m.content }));

  const streamChat = useCallback(
    async (chatMessages: Message[]) => {
      setStreaming(true);
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/weekly-plan/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toApiMessages(chatMessages) }),
        });
        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantText += parsed.text;
                setMessages(prev => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: assistantText };
                  return next;
                });
              }
            } catch {}
          }
        }
      } catch {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: "エラーが発生しました。再度お試しください。" };
          return next;
        });
      } finally {
        setStreaming(false);
      }
    },
    [planId]  // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    streamChat([]);
  }, [streamChat]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setInput("");
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await streamChat(newMessages);
  };

  // Triggered when user clicks a content field
  const handleFieldFocus = useCallback((slug: FieldSlug) => {
    if (streaming) return;
    if (slug === focusedField) return;
    setFocusedField(slug);

    const promptText = FIELD_FOCUS_PROMPTS[slug]
      ?? `「${FIELD_DEFINITIONS[slug].label}」を入力したいです。内容を一緒に考えてください。`;

    const focusMsg: Message = { role: "focus", content: promptText, slug };
    setMessages(prev => {
      const next = [...prev, focusMsg];
      streamChat(next);
      return next;
    });
  }, [streaming, focusedField, streamChat]);

  const adoptProposal = async (fieldLabel: string, text: string) => {
    const slug = findSlugByLabel(fieldLabel);
    if (!slug) return;
    const updated = { ...fields, [slug]: text };
    setFields(updated);
    await updateWeeklyPlanFields(planId, updated);
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    await finalizePlan(planId);
    router.push("/plans");
    router.refresh();
  };

  const headerFields = activeFields.filter(f => HEADER_FIELDS.includes(f));
  const contentFields = activeFields.filter(f => !HEADER_FIELDS.includes(f));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#FDF5E6" }}>
      {/* ── Left: Plan preview ── */}
      <div
        className="w-[40%] flex flex-col overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,183,178,0.18)",
        }}
      >
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,183,178,0.15)" }}>
          <h2 className="font-serif-jp text-sm font-bold" style={{ color: "#4A4A4A", letterSpacing: "0.06em" }}>
            週案プレビュー
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#B4A494" }}>
            項目をクリックするとAIが手伝います
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Header fields */}
          {headerFields.length > 0 && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(209,232,226,0.15)", border: "1px solid rgba(209,232,226,0.4)" }}>
              {headerFields.map(slug => (
                <div key={slug}>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#9A8878", letterSpacing: "0.05em" }}>
                    {FIELD_DEFINITIONS[slug].label}
                  </label>
                  <input
                    type="text"
                    value={fields[slug] ?? ""}
                    onChange={e => handleFieldChange(slug, e.target.value)}
                    className="input-kotonoha w-full text-sm"
                    style={{ color: "#4A4A4A" }}
                    placeholder={FIELD_DEFINITIONS[slug].description}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content fields — clicking triggers AI */}
          {contentFields.map(slug => {
            const isFocused = focusedField === slug;
            return (
              <div
                key={slug}
                className="rounded-xl transition-all"
                style={{
                  padding: "10px 12px",
                  background: isFocused ? "rgba(255,183,178,0.07)" : "transparent",
                  border: isFocused ? "1px solid rgba(255,183,178,0.35)" : "1px solid transparent",
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-sm font-medium" style={{ color: "#4A4A4A" }}>
                    {FIELD_DEFINITIONS[slug].label}
                  </label>
                  {isFocused && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,183,178,0.2)", color: "#C07060" }}>
                      AI対話中
                    </span>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: "#B4A494" }}>
                  {FIELD_DEFINITIONS[slug].description}
                </p>
                <textarea
                  value={fields[slug] ?? ""}
                  onChange={e => handleFieldChange(slug, e.target.value)}
                  onFocus={() => handleFieldFocus(slug)}
                  rows={4}
                  style={{
                    width: "100%",
                    fontSize: "0.875rem",
                    border: "none",
                    borderBottom: `1.5px solid ${isFocused ? "#FFB7B2" : "#D4C4B0"}`,
                    background: "transparent",
                    outline: "none",
                    resize: "none",
                    color: "#4A4A4A",
                    padding: "8px 4px",
                    lineHeight: "1.6",
                    transition: "border-color 0.15s",
                  }}
                  placeholder={`${FIELD_DEFINITIONS[slug].label}を入力…`}
                />
              </div>
            );
          })}

          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="w-full text-sm font-medium py-3 rounded-2xl transition-all disabled:opacity-50 cursor-pointer mt-2"
            style={{
              background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
              color: "#4A4A4A",
              boxShadow: "0 2px 12px rgba(255,183,178,0.35)",
            }}
          >
            {finalizing ? "保存中..." : "週案を完成にする"}
          </button>
        </div>
      </div>

      {/* ── Right: Chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#FDF5E6" }}>
        <div
          className="px-6 py-4 flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,183,178,0.15)",
          }}
        >
          <h2 className="font-serif-jp text-sm font-bold" style={{ color: "#4A4A4A", letterSpacing: "0.06em" }}>
            AIアシスタント
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#B4A494" }}>
            {focusedField
              ? `「${FIELD_DEFINITIONS[focusedField].label}」について話しています`
              : "項目をクリックすると、その項目について話せます"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && streaming && (
            <div className="flex">
              <div
                className="rounded-2xl px-4 py-3 text-sm animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.88)",
                  color: "#B4A494",
                }}
              >
                考え中...
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            // Field focus indicator
            if (msg.role === "focus") {
              return (
                <div key={i} className="flex items-center gap-2 py-1">
                  <div className="h-px flex-1 rounded-full" style={{ background: "rgba(255,183,178,0.3)" }} />
                  <span
                    className="text-[11px] px-3 py-1 rounded-full flex-shrink-0 flex items-center gap-1"
                    style={{ background: "rgba(255,183,178,0.12)", color: "#C07060", border: "1px solid rgba(255,183,178,0.25)" }}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <circle cx="5" cy="5" r="1.5" fill="currentColor"/>
                    </svg>
                    {msg.slug ? FIELD_DEFINITIONS[msg.slug].label : ""}
                  </span>
                  <div className="h-px flex-1 rounded-full" style={{ background: "rgba(255,183,178,0.3)" }} />
                </div>
              );
            }

            const proposal = msg.role === "assistant" ? parseProposal(msg.content) : null;
            const displayContent = msg.role === "assistant" ? stripProposal(msg.content) : msg.content;

            return (
              <div
                key={i}
                className={msg.role === "user" ? "flex justify-end" : "flex flex-col gap-2 items-start"}
              >
                {displayContent && (
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A", boxShadow: "0 2px 8px rgba(255,183,178,0.3)" }
                        : { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.88)", color: "#4A4A4A", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                    }
                  >
                    {displayContent}
                  </div>
                )}

                {proposal && (
                  <div
                    className="max-w-[85%] rounded-2xl p-4 space-y-2"
                    style={{ background: "rgba(255,183,178,0.10)", border: "1px solid rgba(255,183,178,0.35)" }}
                  >
                    <p className="text-xs font-medium" style={{ color: "#C07060" }}>
                      【{proposal.fieldLabel}】への提案
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "#4A4A4A" }}>
                      {proposal.text}
                    </p>
                    <button
                      onClick={() => adoptProposal(proposal.fieldLabel, proposal.text)}
                      className="text-xs px-4 py-1.5 rounded-xl transition-all cursor-pointer font-medium"
                      style={{ background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A", boxShadow: "0 1px 6px rgba(255,183,178,0.35)" }}
                    >
                      この提案を採用する
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          className="px-4 py-4 flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,183,178,0.15)",
          }}
        >
          {focusedField && (
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: "#C07060" }}>
                {FIELD_DEFINITIONS[focusedField].label} について話しています
              </span>
              <button
                onClick={() => setFocusedField(null)}
                className="text-[10px] cursor-pointer"
                style={{ color: "#D4C4B4" }}
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && e.shiftKey && !streaming) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="返答を入力してください…（Shift+Enterで送信）"
              disabled={streaming}
              style={{
                flex: 1,
                fontSize: "0.875rem",
                border: "none",
                borderBottom: "1.5px solid #D4C4B0",
                background: "transparent",
                outline: "none",
                resize: "none",
                color: "#4A4A4A",
                padding: "8px 4px",
                lineHeight: "1.6",
                transition: "border-color 0.15s",
                opacity: streaming ? 0.5 : 1,
              }}
              onFocus={e => {
                if (!streaming) {
                  (e.currentTarget as HTMLElement).style.borderBottomColor = "#FFB7B2";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 0 0 rgba(255,183,178,0.3)";
                }
              }}
              onBlur={e => {
                (e.currentTarget as HTMLElement).style.borderBottomColor = "#D4C4B0";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="text-sm font-medium px-5 py-2.5 rounded-2xl transition-all disabled:opacity-50 cursor-pointer self-end"
              style={{ background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A", boxShadow: "0 2px 8px rgba(255,183,178,0.35)" }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
