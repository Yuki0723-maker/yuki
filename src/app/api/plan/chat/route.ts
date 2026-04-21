import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "dummy";

// 5ステップのモック応答
const MOCK_RESPONSES = [
  "こんにちは！今週の週案を一緒に作っていきましょう。\n\nまず教えてください。担当クラスの**年齢**と、だいたいの**子どもの人数**はどのくらいですか？",
  "ありがとうございます！\n\n**今週の子どもたちの様子**を聞かせてください。印象に残った遊びや活動、出来事など、走り書きで大丈夫です。",
  "活発な一週間でしたね。子どもたちの様子がよく伝わります。\n\n**特定の子どもの様子**や、クラス全体の傾向として気になっていることはありますか？\n（例：言葉の発達、友だちとの関わり方、遊びの集中度など）",
  "子どもたちの育ちをしっかり見ていらっしゃいますね。\n\n**環境と保育者の関わり**について教えてください。今週どんな素材や環境を用意しましたか？また、保育者として意識した関わり方はありましたか？",
  "ていねいな関わりをされていますね。\n\n最後に、**来週に向けて**のことを聞かせてください。やってみたい活動や、特に大切にしたいねらいはありますか？",
  "ありがとうございます！十分な情報が集まりました。\n\nお話いただいた内容をもとに、**保育指針に沿った週案**を作成します。下の「週案を生成する」ボタンを押してください。",
];

const CHAT_SYSTEM_PROMPT = `あなたは経験豊富な保育主任・保育コンサルタントです。
保育士が週案を作成するための対話的サポートを行ってください。

【準拠文書】
- 保育所保育指針（厚生労働省・2018年改定）
- 保育所保育指針解説（厚生労働省・2018年）
- 幼保連携型認定こども園教育・保育要領解説（内閣府・文部科学省・厚生労働省・2018年）

【対話の原則】
- 保育士に寄り添う、温かく親しみやすい丁寧語で話す
- 1回の発言では1〜2つの質問のみ
- 保育専門用語を適切に使いながら、難しくなりすぎない
- 子どもの主体性・発達を大切にする視点で問いかける
- 個人名（子ども・保護者・保育士名）や園名は使わない
- 回答に対して共感・専門的な視点からのコメントをしてから次の質問をする

【収集する情報（5ステップ）】
Step 1: クラスの年齢と子どもの人数
Step 2: 今週の子どもたちの遊び・活動・印象に残った場面
Step 3: 気になる子どもの様子・クラス全体の発達の傾向
Step 4: 準備した環境・素材と保育者の関わり方
Step 5: 来週に向けてのねらい・大切にしたいこと

Step 5の情報を受け取ったら、「ありがとうございます！十分な情報が集まりました。お話いただいた内容をもとに、保育指針に沿った週案を作成します。「週案を生成する」ボタンを押してください。」と伝えてください。`;

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, classProfile } = await req.json() as {
    messages: { role: string; content: string }[];
    classProfile?: { classAge?: number; classSize?: number; teachingStyle?: string; childrenNote?: string };
  };

  const userMessageCount = messages.filter(m => m.role === "user").length;

  if (isMock) {
    const responseText = MOCK_RESPONSES[Math.min(userMessageCount, MOCK_RESPONSES.length - 1)];
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of responseText) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`));
          await new Promise(r => setTimeout(r, 18));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  // クラスプロファイルをシステムプロンプトに追加
  let systemPrompt = CHAT_SYSTEM_PROMPT;
  if (classProfile && (classProfile.classAge || classProfile.teachingStyle || classProfile.childrenNote)) {
    systemPrompt += `\n\n【この先生のクラス情報（事前登録済み）】\n`;
    if (classProfile.classAge !== undefined) systemPrompt += `- 担当クラス: ${classProfile.classAge}歳児\n`;
    if (classProfile.classSize) systemPrompt += `- 子どもの人数: ${classProfile.classSize}名\n`;
    if (classProfile.teachingStyle) systemPrompt += `- 保育スタイル: ${classProfile.teachingStyle}\n`;
    if (classProfile.childrenNote) systemPrompt += `- 子どもたちの傾向: ${classProfile.childrenNote}\n`;
    systemPrompt += `この情報を踏まえて対話してください。Step 1でクラス年齢・人数が既にわかっている場合は確認のみで次に進んでください。`;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: systemPrompt,
          messages: messages as { role: "user" | "assistant"; content: string }[],
        });

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました。" })}\n\n`));
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
