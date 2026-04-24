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
    <div className="flex h-screen overflow-hidden">
      {/* ── Left: Plan preview ── */}
      <div className="w-[40%] flex flex-col border-r border-[#ece4d4] bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0e8d8] flex-shrink-0">
          <h2 className="text-sm font-bold text-[#3d2b1f]">週案プレビュー</h2>
          <p className="text-xs text-[#b09070] mt-0.5">「採用する」を押すと自動で反映・保存されます</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Header fields */}
          {headerFields.length > 0 && (
            <div className="bg-[#faf8f3] rounded-xl p-4 space-y-3">
              {headerFields.map(slug => (
                <div key={slug}>
                  <label className="block text-xs font-semibold text-[#8a6a50] mb-1">
                    {FIELD_DEFINITIONS[slug].label}
                  </label>
                  <input
                    type="text"
                    value={fields[slug] ?? ""}
                    onChange={e => handleFieldChange(slug, e.target.value)}
                    className="w-full text-sm border border-[#ddd0b8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4845a] text-[#3d2b1f]"
                    placeholder={FIELD_DEFINITIONS[slug].description}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content fields */}
          {contentFields.map(slug => (
            <div key={slug}>
              <label className="block text-sm font-semibold text-[#3d2b1f] mb-1">
                {FIELD_DEFINITIONS[slug].label}
              </label>
              <p className="text-xs text-[#b09070] mb-1.5">{FIELD_DEFINITIONS[slug].description}</p>
              <textarea
                value={fields[slug] ?? ""}
                onChange={e => handleFieldChange(slug, e.target.value)}
                rows={4}
                className="w-full text-sm border border-[#ddd0b8] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a]"
                placeholder={`${FIELD_DEFINITIONS[slug].label}を入力…`}
              />
            </div>
          ))}

          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="w-full bg-[#3d2b1f] text-[#f5f0e8] font-bold py-3 rounded-xl hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer mt-2"
          >
            {finalizing ? "保存中..." : "週案を完成にする"}
          </button>
        </div>
      </div>

      {/* ── Right: Chat ── */}
      <div className="flex-1 flex flex-col bg-[#faf8f3] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ece4d4] bg-white flex-shrink-0">
          <h2 className="text-sm font-bold text-[#3d2b1f]">AIアシスタント</h2>
          <p className="text-xs text-[#b09070] mt-0.5">先週の様子を話してください。一緒に週案を作ります</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Loading state before first response */}
          {messages.length === 0 && streaming && (
            <div className="flex">
              <div className="bg-white border border-[#ece4d4] rounded-2xl px-4 py-3 text-sm text-[#b09070] animate-pulse">
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#3d2b1f] text-[#f5f0e8]"
                        : "bg-white border border-[#ece4d4] text-[#3d2b1f]"
                    }`}
                  >
                    {displayContent}
                  </div>
                )}

                {proposal && (
                  <div className="max-w-[85%] bg-[#fff8f0] border border-[#f0d8b8] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-[#a85c38]">
                      ✏️ 【{proposal.fieldLabel}】への提案
                    </p>
                    <p className="text-sm text-[#3d2b1f] whitespace-pre-wrap leading-relaxed">
                      {proposal.text}
                    </p>
                    <button
                      onClick={() => adoptProposal(proposal.fieldLabel, proposal.text)}
                      className="text-xs bg-[#d4845a] text-white px-4 py-1.5 rounded-lg hover:bg-[#c07040] transition-colors cursor-pointer font-medium"
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
        <div className="px-4 py-4 border-t border-[#ece4d4] bg-white flex-shrink-0">
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
              className="flex-1 text-sm border border-[#ddd0b8] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#d4845a] resize-none text-[#3d2b1f] placeholder-[#c4aa8a] disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="px-5 py-2.5 bg-[#3d2b1f] text-[#f5f0e8] rounded-xl hover:bg-[#5c3d2e] transition-colors disabled:opacity-50 cursor-pointer text-sm font-medium self-end"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
