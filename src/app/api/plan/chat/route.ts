import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const hasGroq      = !!(process.env.GROQ_API_KEY      && process.env.GROQ_API_KEY      !== "dummy");
const hasGemini    = !!(process.env.GEMINI_API_KEY    && process.env.GEMINI_API_KEY    !== "dummy");
const hasOpenAI    = !!(process.env.OPENAI_API_KEY    && process.env.OPENAI_API_KEY    !== "dummy");
const hasAnthropic = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "dummy");
const isMock = !hasGroq && !hasGemini && !hasOpenAI && !hasAnthropic;

// モック：ユーザーの言葉を拾った応答
function buildMockResponse(userMessageCount: number, lastUserMsg: string): string {
  const s = lastUserMsg.trim();
  const short = s.length > 20 ? s.slice(0, 20) + "…" : s;
  const responses = [
    "今週のクラス、どんな感じでしたか？",
    `「${short}」なんですね。\n\nその中で、特に印象に残った場面はありましたか？子どもたちがどんなふうに動いていたか、もう少し聞かせてもらえますか？`,
    `そうだったんですね。先生はその時、どんなふうに関わりましたか？`,
    `ていねいに見ていらっしゃいますね。\n\n「${short}」という場面で、その子（たち）にとってどんな意味があったと思いますか？先生はどんなことを感じましたか？`,
    `なるほど。クラス全体を見たとき、今週はどんな雰囲気や流れがありましたか？`,
    `「${short}」を踏まえて、来週に向けて何か意識したいことや試してみたいことはありますか？`,
    `今週の様子がとてもよく伝わりました。丁寧に子どもたちを見ていらっしゃいますね。\n\n週案を作成しましょうか？`,
  ];
  return responses[Math.min(userMessageCount, responses.length - 1)];
}

const SYSTEM_PROMPT = `あなたは保育園の経験豊富な主任保育士です。
担当の保育士が今週の振り返りを話してくれています。

あなたの役割は「聴く主任」です。評価・指示はせず、保育士が自分で気づきを得られるよう、
コーチングのように深掘りしながら丁寧に対話してください。

【応答の型（必ず守る）】
毎回この順序で応答する：
1. 相手の言葉を「○○だったんですね」「○○という状況なんですね」と繰り返す（必須・省略禁止）
2. 共感や保育の専門的な視点を一言添える
3. 質問は必ず1つだけ

例：
保育士「砂場で子どもたちが大きな山を作っていました」
主任「砂場で大きな山を一緒に作っていたんですね。協同する楽しさが生まれていた瞬間ですね。先生はその時、どんなふうに関わっていましたか？」

【質問のバリエーション】
- 「先生はその時、どう感じましたか？」
- 「他の子はどんな様子でしたか？」
- 「その後どうなりましたか？」
- 「その子にとって、どんな意味があったと思いますか？」
- 「環境や素材の工夫で何かしたことはありましたか？」
- 「来週に向けて、どんなことを試してみたいですか？」

【準拠する保育の視点】
- 保育所保育指針（厚生労働省・2018年改定）・保育所保育指針解説
- 幼保連携型認定こども園教育・保育要領解説（2018年）
- 子どもの主体性・発達の連続性・遊びの中の学び

【対話の進め方】
最初の挨拶は「今週のクラス、どんな感じでしたか？」のみ。
以下のテーマが自然に出てくるまで深掘りする：
- 今週の遊び・活動・印象的な場面
- 気になった子どもの様子（個人・グループ）
- 保育者自身の関わり方や感じたこと
- 環境・素材の工夫
- 来週に向けてのねらいや思い

十分な情報が集まったと感じたら（通常6〜9回のやり取り後）、
「今週の様子がとてもよく伝わりました。週案を作成しましょうか？」と提案する。

【禁止事項】
- 相手の言葉を無視して次の質問に進むこと
- 一度に2つ以上の質問をすること
- 個人名（子ども・保育士・保護者）や園名を使うこと`;

const encoder = new TextEncoder();

function buildFullPrompt(classProfile?: {
  classAge?: number | null;
  classSize?: number | null;
  teachingStyle?: string | null;
  childrenNote?: string | null;
}): string {
  let prompt = SYSTEM_PROMPT;
  if (!classProfile) return prompt;
  const lines: string[] = [];
  if (classProfile.classAge !== null && classProfile.classAge !== undefined)
    lines.push(`- 担当クラス: ${classProfile.classAge}歳児`);
  if (classProfile.classSize)
    lines.push(`- 子どもの人数: ${classProfile.classSize}名`);
  if (classProfile.teachingStyle)
    lines.push(`- 保育スタイル: ${classProfile.teachingStyle}`);
  if (classProfile.childrenNote)
    lines.push(`- 子どもたちの傾向: ${classProfile.childrenNote}`);
  if (lines.length > 0) {
    prompt += `\n\n【この保育士のクラス情報（事前登録済み）】\n${lines.join("\n")}\n\nこの情報は把握済みなので、クラスの年齢や人数を改めて聞かないこと。`;
  }
  return prompt;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, classProfile } = await req.json() as {
    messages: { role: string; content: string }[];
    classProfile?: { classAge?: number | null; classSize?: number | null; teachingStyle?: string | null; childrenNote?: string | null };
  };

  const userMessageCount = messages.filter(m => m.role === "user").length;
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
  const systemPrompt = buildFullPrompt(classProfile);
  const chatMessages = messages as { role: "user" | "assistant"; content: string }[];

  const sseHeaders = { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" };

  // ── モック ──────────────────────────────────────────
  if (isMock) {
    const text = buildMockResponse(userMessageCount, lastUserMsg);
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`));
          await new Promise(r => setTimeout(r, 18));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  // ── Groq (Llama) ────────────────────────────────────
  if (hasGroq) {
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 400,
            messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
            stream: true,
          });
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "エラーが発生しました";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  // ── Gemini ──────────────────────────────────────────
  if (hasGemini) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: systemPrompt,
    });

    // Gemini形式に変換（assistant → model）
    const contents = chatMessages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    // 初回（メッセージなし）はトリガーを送って挨拶させる
    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: "会話を始めてください" }] });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({ contents });
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "エラーが発生しました";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  // ── OpenAI ──────────────────────────────────────────
  if (hasOpenAI) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 400,
            messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
            stream: true,
          });
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました。" })}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(stream, { headers: sseHeaders });
  }

  // ── Anthropic (Claude) ──────────────────────────────
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: systemPrompt,
          messages: chatMessages,
        });
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました。" })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, { headers: sseHeaders });
}
