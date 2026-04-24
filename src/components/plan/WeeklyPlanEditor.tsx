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
  role: "user" | "assistant";
  content: string;
}

const HEADER_FIELDS: FieldSlug[] = [
  "class_name", "week_date", "teacher_name", "enrollment_count", "month_plan_week",
];

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

  const streamChat = useCallback(
    async (chatMessages: Message[]) => {
      setStreaming(true);
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/weekly-plan/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
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
        <div
          className="px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,183,178,0.15)" }}
        >
          <h2
            className="font-serif-jp text-sm font-bold"
            style={{ color: "#4A4A4A", letterSpacing: "0.06em" }}
          >
            週案プレビュー
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#B4A494" }}>
            「採用する」を押すと自動で反映・保存されます
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Header fields */}
          {headerFields.length > 0 && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(209,232,226,0.15)", border: "1px solid rgba(209,232,226,0.4)" }}
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

          {/* Content fields */}
          {contentFields.map(slug => (
            <div key={slug}>
              <label className="block text-sm font-medium mb-0.5" style={{ color: "#4A4A4A" }}>
                {FIELD_DEFINITIONS[slug].label}
              </label>
              <p className="text-xs mb-2" style={{ color: "#B4A494" }}>
                {FIELD_DEFINITIONS[slug].description}
              </p>
              <textarea
                value={fields[slug] ?? ""}
                onChange={e => handleFieldChange(slug, e.target.value)}
                rows={4}
                style={{
                  width: "100%",
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
                }}
                placeholder={`${FIELD_DEFINITIONS[slug].label}を入力…`}
                onFocus={e => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor = "#FFB7B2";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 0 0 rgba(255,183,178,0.3)";
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor = "#D4C4B0";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              />
            </div>
          ))}

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
          <h2
            className="font-serif-jp text-sm font-bold"
            style={{ color: "#4A4A4A", letterSpacing: "0.06em" }}
          >
            AIアシスタント
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#B4A494" }}>
            先週の様子を話してください。一緒に週案を作ります
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Loading state before first response */}
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
                        ? {
                            background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
                            color: "#4A4A4A",
                            boxShadow: "0 2px 8px rgba(255,183,178,0.3)",
                          }
                        : {
                            background: "rgba(255,255,255,0.72)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.88)",
                            color: "#4A4A4A",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }
                    }
                  >
                    {displayContent}
                  </div>
                )}

                {proposal && (
                  <div
                    className="max-w-[85%] rounded-2xl p-4 space-y-2"
                    style={{
                      background: "rgba(255,183,178,0.10)",
                      border: "1px solid rgba(255,183,178,0.35)",
                    }}
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
                      style={{
                        background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
                        color: "#4A4A4A",
                        boxShadow: "0 1px 6px rgba(255,183,178,0.35)",
                      }}
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
              placeholder="今週の様子を話してください…（Shift+Enterで送信）"
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
              style={{
                background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
                color: "#4A4A4A",
                boxShadow: "0 2px 8px rgba(255,183,178,0.35)",
              }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
