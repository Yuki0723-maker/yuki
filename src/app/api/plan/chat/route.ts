import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "dummy";

// 主任との自然な対話を模したモック応答
// ユーザーの言葉に対して深掘りする質問を返す（固定文だが自然な流れに）
const MOCK_RESPONSES = [
  "今週のクラス、どんな感じでしたか？",
  "そうなんですね。\n\nその中で、特に印象に残った場面はありましたか？どんなふうに展開していったのかも聞かせてもらえますか？",
  "なるほど。先生はその時、どんなふうに関わりましたか？",
  "ていねいに見ていらっしゃいますね。\n\nその子（たち）にとって、今その遊びや関わりはどんな意味があると思いますか？先生自身はどう感じましたか？",
  "クラス全体として見たとき、今週はどんな雰囲気や流れがありましたか？気になっていることがあれば教えてください。",
  "来週に向けて、何か意識したいことや試してみたいことはありますか？",
  "今週の様子がとてもよく伝わりました。丁寧に子どもたちを見ていらっしゃいますね。\n\n週案を作成しましょうか？",
];

const CHAT_SYSTEM_PROMPT = `あなたは保育園の経験豊富な主任保育士です。
担当の保育士が、週の振り返りを話してくれています。

主任として、一緒に今週を振り返りながら、次の週案づくりにつながる対話をしてください。
保育士が自分で気づきを得られるよう、コーチングのように関わってください。

【あなたのスタイル】
- 温かく、保育士に寄り添う言葉で話す
- 相手が話した言葉の中にある「キーワード」を必ず拾って深掘りする
- 「なぜ？」「どんな様子でしたか？」「先生はどう感じましたか？」「他の子はどうでしたか？」など多角的に問いかける
- 一度に聞くのは必ず一つの質問のみ
- 共感・保育の専門的な視点を添えてから質問する
- 断定せず、保育士自身の気づきを引き出す
- 保育士の言葉を繰り返して「○○だったんですね」と確認してから次へ

【準拠する保育の視点】
- 保育所保育指針（厚生労働省・2018年改定）
- 保育所保育指針解説（2018年）
- 幼保連携型認定こども園教育・保育要領解説（2018年）
- 子どもの主体性・発達の連続性・遊びの中の学び

【対話の進め方】
最初の挨拶は「今週のクラス、どんな感じでしたか？」のみ。
保育士の言葉に応じて、以下のテーマが自然に出てくるまで深掘りする：
- 今週の遊び・活動・印象的な場面
- 気になった子どもの様子（個人・グループ）
- 保育者自身の関わり方や感じたこと
- 環境・素材の工夫
- 来週に向けてのねらいや思い

十分な情報が集まったと感じたら（通常6〜9回のやり取り後）、
「今週の様子がとてもよく伝わりました。週案を作成しましょうか？」と提案してください。

【重要】個人名（子ども・保育士・保護者）や園名は絶対に使わない。`;

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, classProfile } = await req.json() as {
    messages: { role: string; content: string }[];
    classProfile?: { classAge?: number | null; classSize?: number | null; teachingStyle?: string | null; childrenNote?: string | null };
  };

  const userMessageCount = messages.filter(m => m.role === "user").length;

  if (isMock) {
    const idx = Math.min(userMessageCount, MOCK_RESPONSES.length - 1);
    const responseText = MOCK_RESPONSES[idx];
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
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
    });
  }

  // クラス情報をシステムプロンプトに追加
  let systemPrompt = CHAT_SYSTEM_PROMPT;
  if (classProfile) {
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
      systemPrompt += `\n\n【この保育士のクラス情報（事前登録済み）】\n${lines.join("\n")}\n\nこの情報は把握済みなので、クラスの年齢や人数を改めて聞かないこと。`;
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: systemPrompt,
          messages: messages as { role: "user" | "assistant"; content: string }[],
        });
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました。" })}\n\n`));
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}
