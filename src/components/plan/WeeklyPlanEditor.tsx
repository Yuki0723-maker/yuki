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

// Predefined opening questions shown instantly when a field is clicked (no API call)
const FIELD_OPENING_QUESTIONS: Partial<Record<FieldSlug, string>> = {
  prev_week_observation:     "先週、子どもたちはどんな遊びや活動をしていましたか？印象に残った場面があれば教えてください。",
  weekly_goal:               "今週のクラスで特に大切にしたいこと、子どもたちに経験してほしいことはありますか？",
  activities:                "今週はどんな活動を考えていますか？室内・戸外、制作・体験など思いつくものを教えてください。",
  child_behavior_prediction: "計画している活動の中で、子どもたちがどんなふうに反応しそうか、楽しみにしていることはありますか？",
  teacher_support:           "子どもたちへの関わりで、今週特に意識したいことや気をつけたいことはありますか？",
  environment_setup:         "今週の活動に向けて、どんな空間や道具・素材を用意しようと考えていますか？",
  individual_care:           "今週、特に気にかけている子どもや、個別に配慮が必要な場面はありますか？",
  health_safety:             "今週、健康面や安全面で特に気をつけたいことはありますか？体調の変化や季節の影響なども教えてください。",
  food_education:            "今週の給食や食育で、子どもたちに伝えたいことや取り組みたいことはありますか？",
  family_community:          "今週、保護者に伝えたいことや、地域との関わりで予定していることはありますか？",
  weather_contingency:       "天気が悪くて外に出られない場合、どんな室内活動を考えていますか？",
  weekly_reflection:         "今週を振り返ってみて、うまくいったことや次に活かしたいことを教えてください。",
  five_domains:              "今週の活動は、5領域（健康・人間関係・環境・言葉・表現）とどんなつながりがありましたか？",
  sleep_feeding_record:      "今週の子どもたちの睡眠や授乳・おむつのリズムで、気になることや変化はありましたか？",
  individual_development:    "子どもたちの発達で、今週気づいたことや成長を感じた場面を教えてください。",
  parent_communication:      "今週、連絡帳を通じて保護者と共有したいことや気になる家庭の様子はありますか？",
  allergy_response:          "今週の食事対応で、アレルギーや離乳食に関して特に確認しておきたいことはありますか？",
  duty_activities:           "今週の当番活動や係活動で、どんなことを子どもたちに任せる予定ですか？",
  group_play:                "今週予定している集団遊びやルール遊びを教えてください。子どもたちの好きな遊びも合わせて。",
  nap_record:                "今週の午睡について、時間や対応で気をつけたいことはありますか？",
  school_readiness:          "就学に向けて、今週特に意識して取り組みたいことはありますか？",
  structured_free_play:      "今週の設定保育と自由遊び、どんなバランスで考えていますか？",
  subject_goals:             "今週、各領域でどんなことを大切にしたいですか？特に力を入れたい領域はありますか？",
  parent_newsletter:         "今週のクラスだよりや保護者への連絡で、伝えたいことを教えてください。",
  extended_care:             "今週の預かり保育で、どんな活動や過ごし方を予定していますか？",
};

function parseProposal(content: string): { fieldLabel: string; text: string } | null {
  const match = content.match(/---提案---\n【(.+?)】\n([\s\S]+?)\n----------/);
  if (!match) return null;
  return { fieldLabel: match[1], text: match[2].trim() };
}

function findSlugByLabel(label: string): FieldSlug | null {
  // Strip leading number prefix like "1. " if the AI accidentally adds it
  const stripped = label.replace(/^\d+\.\s*/, "").trim();
  const entry = Object.entries(FIELD_DEFINITIONS).find(
    ([, def]) => def.label === stripped || def.label === label
  );
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

  // Triggered when user clicks a content field — shows predefined question instantly, no API call
  const handleFieldFocus = useCallback((slug: FieldSlug) => {
    if (streaming) return;
    if (slug === focusedField) return;
    setFocusedField(slug);

    const question = FIELD_OPENING_QUESTIONS[slug]
      ?? `「${FIELD_DEFINITIONS[slug].label}」について教えてください。`;

    // Focus pill + predefined assistant question (instant, no API call)
    const focusMsg: Message = { role: "focus", content: `「${FIELD_DEFINITIONS[slug].label}」について話しています。`, slug };
    const questionMsg: Message = { role: "assistant", content: question };
    setMessages(prev => [...prev, focusMsg, questionMsg]);
  }, [streaming, focusedField]);

  const adoptProposal = async (fieldLabel: string, text: string) => {
    // Try exact/stripped label match; fall back to currently focused field
    const slug = findSlugByLabel(fieldLabel) ?? focusedField;
    if (!slug) return;
    const current = fields[slug] ?? "";
    // Append to existing content (with separator) rather than overwrite if already has content
    const next = current.trim() ? `${current.trim()}\n${text}` : text;
    const updated = { ...fields, [slug]: next };
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

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Header fields — dim when a content field is focused */}
          {headerFields.length > 0 && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                background: "rgba(209,232,226,0.15)",
                border: "1px solid rgba(209,232,226,0.4)",
                transition: "opacity 0.25s, filter 0.25s",
                opacity: focusedField ? 0.3 : 1,
                filter: focusedField ? "blur(1.5px)" : "none",
                pointerEvents: focusedField ? "none" : "auto",
              }}
            >
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

          {/* Content fields — spotlight effect on focus */}
          {contentFields.map(slug => {
            const isFocused = focusedField === slug;
            const isDimmed = focusedField !== null && !isFocused;
            return (
              <div
                key={slug}
                className="rounded-2xl"
                style={{
                  padding: "14px 16px",
                  background: isFocused ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                  border: isFocused ? "1.5px solid rgba(255,183,178,0.5)" : "1px solid rgba(255,255,255,0.7)",
                  boxShadow: isFocused ? "0 8px 32px rgba(255,183,178,0.25), 0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transform: isFocused ? "scale(1.02)" : isDimmed ? "scale(0.98)" : "scale(1)",
                  opacity: isDimmed ? 0.3 : 1,
                  filter: isDimmed ? "blur(1.5px)" : "none",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  cursor: isDimmed ? "pointer" : "default",
                  zIndex: isFocused ? 2 : 1,
                  position: "relative",
                }}
                onClick={() => { if (isDimmed) handleFieldFocus(slug); }}
              >
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-sm font-medium"
                    style={{ color: isFocused ? "#3A3A3A" : "#4A4A4A", letterSpacing: isFocused ? "0.02em" : undefined }}
                  >
                    {FIELD_DEFINITIONS[slug].label}
                  </label>
                  {isFocused && (
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{ background: "linear-gradient(135deg, #FFB7B2, #ffcac6)", color: "#4A4A4A" }}
                    >
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
                  rows={isFocused ? 5 : 3}
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
                    lineHeight: "1.7",
                    transition: "border-color 0.2s, height 0.25s",
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
