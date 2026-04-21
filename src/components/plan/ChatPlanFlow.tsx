"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PlanResult } from "./PlanResult";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GeneratedPlanData {
  id: string;
  targetAge: number;
  formatType: string;
  goal: string;
  content: string;
  environment: string;
  support: string;
  guidelineRef: string;
}

interface Template {
  id: string;
  name: string;
}

interface ClassProfile {
  classAge?: number | null;
  classSize?: number | null;
  teachingStyle?: string | null;
  childrenNote?: string | null;
}

interface Props {
  templates: Template[];
  classProfile?: ClassProfile;
}

const STEPS = [
  { label: "クラス確認" },
  { label: "今週の様子" },
  { label: "子どもの観察" },
  { label: "環境・援助" },
  { label: "来週のねらい" },
];

const FORMAT_OPTIONS = [
  { value: "standard", label: "保育所（3〜5歳）", desc: "5領域・集団活動中心の週案" },
  { value: "young", label: "0〜2歳児クラス", desc: "養護＋教育・個別記録重視の週案" },
  { value: "yochien", label: "認定こども園", desc: "教育・保育要領準拠の週案" },
];

export function ChatPlanFlow({ templates, classProfile }: Props) {
  const [formatType, setFormatType] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [canGenerate, setCanGenerate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlanData | null>(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userMessageCount = messages.filter(m => m.role === "user").length;
  const currentStep = Math.min(userMessageCount + 1, STEPS.length);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (userMessageCount >= 5) setCanGenerate(true);
  }, [userMessageCount]);

  const streamMessage = useCallback(async (currentMessages: Message[]) => {
    setIsStreaming(true);
    setStreamingText("");
    setError("");

    try {
      const res = await fetch("/api/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages,
          classProfile: classProfile ?? null,
        }),
      });

      if (!res.ok || !res.body) throw new Error("応答の取得に失敗しました");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const { text } = JSON.parse(data) as { text: string };
            fullText += text;
            setStreamingText(fullText);
          } catch { /* ignore parse errors */ }
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [classProfile]);

  // フォーマット選択後に最初の挨拶を取得
  useEffect(() => {
    if (formatType !== null) {
      streamMessage([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatType]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    await streamMessage(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/plan/generate-from-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, formatType }),
      });
      if (!res.ok) throw new Error("生成に失敗しました");
      const data = await res.json() as GeneratedPlanData;
      setPlan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsGenerating(false);
    }
  };

  // 週案生成結果の表示
  if (plan) {
    return <PlanResult plan={plan} templates={templates} onBack={() => setPlan(null)} />;
  }

  // フォーマット選択画面
  if (formatType === null) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#3d2b1f] mb-1">週案のフォーマットを選んでください</h2>
          <p className="text-sm text-[#b09070]">クラスの年齢に合ったフォーマットで週案を作成します</p>
        </div>
        <div className="space-y-3">
          {FORMAT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFormatType(opt.value)}
              className="w-full bg-white border border-[#ece4d4] rounded-2xl p-5 text-left hover:border-[#d4845a] hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#3d2b1f] group-hover:text-[#a85c38] transition-colors">
                    {opt.label}
                  </p>
                  <p className="text-xs text-[#b09070] mt-0.5">{opt.desc}</p>
                </div>
                <span className="text-[#ddd0b8] text-xl group-hover:text-[#d4845a] transition-colors">›</span>
              </div>
            </button>
          ))}
        </div>
        {classProfile?.classAge !== null && classProfile?.classAge !== undefined && (
          <p className="text-xs text-[#b09070] text-center">
            登録クラス: {classProfile.classAge}歳児
            {classProfile.classSize ? `・${classProfile.classSize}名` : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      {/* ステップインジケーター */}
      <div className="bg-white border border-[#ece4d4] rounded-2xl p-3 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                i + 1 < currentStep ? "bg-[#3d2b1f] text-white" :
                i + 1 === currentStep ? "bg-[#d4845a] text-white" :
                "bg-[#f0e8df] text-[#b09070]"
              }`}>
                {i + 1 < currentStep ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden md:block ${
                i + 1 === currentStep ? "text-[#3d2b1f] font-medium" : "text-[#c4aa8a]"
              }`}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-3 h-px mx-0.5 flex-shrink-0 ${i + 1 < currentStep ? "bg-[#3d2b1f]" : "bg-[#ddd0b8]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* チャット画面 */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {(streamingText || (isStreaming && !streamingText)) && (
          <ChatBubble role="assistant" content={streamingText} isStreaming />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* エラー */}
      {error && (
        <p className="flex-shrink-0 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl mb-2">{error}</p>
      )}

      {/* 生成中 */}
      {isGenerating && (
        <div className="flex-shrink-0 bg-[#faf8f3] border border-[#ece4d4] rounded-2xl p-4 text-center mb-2">
          <div className="flex items-center justify-center gap-2 text-[#3d2b1f]">
            <Spinner />
            <span className="text-sm font-medium">保育指針をもとに週案を作成中...</span>
          </div>
          <p className="text-xs text-[#b09070] mt-1">10〜30秒ほどお待ちください</p>
        </div>
      )}

      {/* 週案生成ボタン */}
      {canGenerate && !isGenerating && (
        <button
          onClick={handleGenerate}
          className="flex-shrink-0 w-full bg-[#3d2b1f] text-[#f5f0e8] rounded-xl font-bold text-sm py-3.5 hover:bg-[#5c3d2e] transition-colors mb-2"
        >
          週案を生成する →
        </button>
      )}

      {/* 入力欄 */}
      {!isGenerating && (
        <div className="flex-shrink-0 bg-white border border-[#ece4d4] rounded-2xl p-3 flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canGenerate ? "追加情報があれば入力できます（任意）" : "返答を入力... （Enterで送信）"}
            rows={2}
            disabled={isStreaming}
            className="flex-1 resize-none border-none outline-none text-sm text-[#3d2b1f] placeholder-[#c4aa8a] bg-transparent leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-[#3d2b1f] text-[#f5f0e8] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5c3d2e] transition-colors disabled:opacity-30 self-end cursor-pointer"
          >
            送信
          </button>
        </div>
      )}
    </div>
  );
}

// チャットバブル
function ChatBubble({ role, content, isStreaming }: { role: "user" | "assistant"; content: string; isStreaming?: boolean }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} gap-2`}>
      {role === "assistant" && (
        <div className="w-7 h-7 rounded-full bg-[#3d2b1f] flex items-center justify-center flex-shrink-0 mt-1">
          <CupIconSm />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        role === "user"
          ? "bg-[#3d2b1f] text-[#f5f0e8] rounded-tr-sm"
          : "bg-white border border-[#ece4d4] text-[#3d2b1f] rounded-tl-sm"
      }`}>
        {content ? (
          role === "assistant" ? (
            <span
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ) : (
            <span className="whitespace-pre-wrap">{content}</span>
          )
        ) : (
          <div className="flex gap-1 items-center py-0.5">
            <span className="w-2 h-2 bg-[#d4845a] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#d4845a] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#d4845a] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        {isStreaming && content && (
          <span className="inline-block w-0.5 h-3.5 bg-[#d4845a] animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CupIconSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 5.5 Q2 11 7 11 Q12 11 12 5.5 Z" stroke="#f5f0e8" strokeWidth="1.2" fill="none" />
      <rect x="1.5" y="3.5" width="11" height="3" rx="1.5" stroke="#f5f0e8" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
