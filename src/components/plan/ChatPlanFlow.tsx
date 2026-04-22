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

function detectFormat(classAge: number | null | undefined): string {
  if (classAge !== null && classAge !== undefined && classAge <= 2) return "young";
  return "standard";
}

function isGenerateSuggested(messages: Message[]): boolean {
  const lastAI = [...messages].reverse().find(m => m.role === "assistant");
  if (!lastAI) return false;
  return (
    lastAI.content.includes("週案を作成しましょうか") ||
    lastAI.content.includes("週案を作成しますか") ||
    lastAI.content.includes("週案づくりに入りましょう") ||
    lastAI.content.includes("週案を作りましょう")
  );
}

// AIテキストから読み上げ用にマークダウンを除去
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\n+/g, "、");
}

export function ChatPlanFlow({ templates, classProfile }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlanData | null>(null);
  const [error, setError] = useState("");

  // 音声関連
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // AI読み上げON/OFF
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimText, setInterimText] = useState(""); // 認識中テキスト
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  const userMessageCount = messages.filter(m => m.role === "user").length;
  const canGenerate = userMessageCount >= 6 || isGenerateSuggested(messages);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // AI返答を音声で読み上げ
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.lang = "ja-JP";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    // 日本語音声を優先して選択
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith("ja"));
    if (jaVoice) utterance.voice = jaVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // 音声入力の開始・停止
  const toggleListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("このブラウザは音声入力に対応していません。Chromeをお試しください。");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        setInput(prev => prev + (prev ? "\n" : "") + final);
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };
    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
    };
    rec.onerror = () => {
      setIsListening(false);
      setInterimText("");
    };
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, [isListening]);

  const streamMessage = useCallback(async (currentMessages: Message[]) => {
    setIsStreaming(true);
    setStreamingText("");
    setError("");
    stopSpeaking();

    try {
      const res = await fetch("/api/plan/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, classProfile: classProfile ?? null }),
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
          } catch { /* ignore */ }
        }
      }

      const aiMessage: Message = { role: "assistant", content: fullText };
      setMessages(prev => [...prev, aiMessage]);
      setStreamingText("");
      speak(fullText); // 読み上げ
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [classProfile, speak]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    streamMessage([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); }
    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setInterimText("");
    await streamMessage(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    stopSpeaking();
    try {
      const formatType = detectFormat(classProfile?.classAge);
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
      setIsGenerating(false);
    }
  };

  if (plan) {
    return <PlanResult plan={plan} templates={templates} onBack={() => { setPlan(null); stopSpeaking(); }} />;
  }

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>

      {/* ヘッダー：クラス情報 + 音声読み上げトグル */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {classProfile?.classAge !== null && classProfile?.classAge !== undefined && (
            <span className="bg-[#f0e8df] text-[#a85c38] text-xs font-semibold px-3 py-1 rounded-full">
              {classProfile.classAge}歳児
              {classProfile.classSize ? ` · ${classProfile.classSize}名` : ""}
            </span>
          )}
        </div>

        {/* AI読み上げトグル */}
        <button
          onClick={() => { setVoiceEnabled(v => !v); if (isSpeaking) stopSpeaking(); }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
            voiceEnabled
              ? "bg-[#3d2b1f] text-[#f5f0e8] border-[#3d2b1f]"
              : "bg-white text-[#8a6a50] border-[#ddd0b8] hover:border-[#d4845a]"
          }`}
        >
          <SpeakerIcon active={voiceEnabled} />
          {isSpeaking ? "読み上げ中..." : voiceEnabled ? "音声ON" : "音声OFF"}
        </button>
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

      {error && (
        <p className="flex-shrink-0 text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl mb-2">{error}</p>
      )}

      {isGenerating && (
        <div className="flex-shrink-0 bg-[#faf8f3] border border-[#ece4d4] rounded-2xl p-4 text-center mb-2">
          <div className="flex items-center justify-center gap-2 text-[#3d2b1f]">
            <Spinner />
            <span className="text-sm font-medium">保育指針をもとに週案を作成中...</span>
          </div>
          <p className="text-xs text-[#b09070] mt-1">10〜30秒ほどお待ちください</p>
        </div>
      )}

      {canGenerate && !isGenerating && (
        <button
          onClick={handleGenerate}
          className="flex-shrink-0 w-full bg-[#3d2b1f] text-[#f5f0e8] rounded-xl font-bold text-sm py-3.5 hover:bg-[#5c3d2e] transition-colors mb-2 cursor-pointer"
        >
          週案を生成する →
        </button>
      )}

      {/* 入力欄 + マイクボタン */}
      {!isGenerating && (
        <div className={`flex-shrink-0 bg-white border rounded-2xl p-3 flex gap-2 transition-colors ${
          isListening ? "border-[#d4845a] shadow-sm shadow-[#f0e8df]" : "border-[#ece4d4]"
        }`}>
          <div className="flex-1 flex flex-col gap-1">
            <textarea
              ref={inputRef}
              value={input + (interimText ? interimText : "")}
              onChange={e => { if (!isListening) setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "聞いています..." : "話しかけてみてください... （Enterで送信）"}
              rows={2}
              disabled={isStreaming}
              className="resize-none border-none outline-none text-sm text-[#3d2b1f] placeholder-[#c4aa8a] bg-transparent leading-relaxed"
            />
            {interimText && (
              <p className="text-xs text-[#b09070] italic">{interimText}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5 self-end">
            {/* マイクボタン */}
            <button
              onClick={toggleListening}
              disabled={isStreaming}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-[#d4845a] text-white border-[#d4845a] animate-pulse"
                  : "bg-[#faf8f3] text-[#8a6a50] border-[#ddd0b8] hover:border-[#d4845a]"
              }`}
              title={isListening ? "停止" : "音声入力"}
            >
              <MicIcon />
            </button>
            {/* 送信ボタン */}
            <button
              onClick={handleSend}
              disabled={isStreaming || (!input.trim() && !interimText)}
              className="bg-[#3d2b1f] text-[#f5f0e8] rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#5c3d2e] transition-colors disabled:opacity-30 cursor-pointer"
            >
              送信
            </button>
          </div>
        </div>
      )}

      {/* 音声入力中のヒント */}
      {isListening && (
        <p className="text-center text-xs text-[#d4845a] mt-1 flex-shrink-0">
          話し終わったら自動で止まります。もう一度押すと停止します。
        </p>
      )}
    </div>
  );
}

function ChatBubble({ role, content, isStreaming }: { role: "user" | "assistant"; content: string; isStreaming?: boolean }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} gap-2`}>
      {role === "assistant" && <TeacherAvatar />}
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
                  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
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

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M2 8C2 11.3 13 11.3 13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerIcon({ active }: { active: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 4.5H4.5L7.5 2V11L4.5 8.5H2V4.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      {active && (
        <>
          <path d="M9 4C9.8 4.8 9.8 8.2 9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M10.5 2.5C12.2 4.2 12.2 8.8 10.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
    </svg>
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

function TeacherAvatar() {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border border-[#e8d5c0]">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* 背景 */}
        <rect width="32" height="32" fill="#fde8d0"/>
        {/* 髪 */}
        <path d="M6 17 Q6 6 16 6 Q26 6 26 17" fill="#6b3a20"/>
        <rect x="6" y="15" width="3" height="9" rx="1.5" fill="#6b3a20"/>
        <rect x="23" y="15" width="3" height="9" rx="1.5" fill="#6b3a20"/>
        {/* 顔 */}
        <circle cx="16" cy="18" r="8.5" fill="#f5c89a"/>
        {/* 目 */}
        <circle cx="12.5" cy="17" r="1.3" fill="#3d2b1f"/>
        <circle cx="19.5" cy="17" r="1.3" fill="#3d2b1f"/>
        {/* 目のハイライト */}
        <circle cx="13" cy="16.5" r="0.4" fill="white"/>
        <circle cx="20" cy="16.5" r="0.4" fill="white"/>
        {/* 笑顔 */}
        <path d="M12.5 21 Q16 24 19.5 21" stroke="#c0622f" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        {/* ほっぺ */}
        <circle cx="10.5" cy="20.5" r="2.2" fill="#f0a0a0" opacity="0.35"/>
        <circle cx="21.5" cy="20.5" r="2.2" fill="#f0a0a0" opacity="0.35"/>
        {/* 服・えり */}
        <path d="M7 31 Q7 27 16 27 Q25 27 25 31" fill="#d4845a"/>
        <path d="M14 27 L16 30 L18 27" fill="#c0622f"/>
      </svg>
    </div>
  );
}
