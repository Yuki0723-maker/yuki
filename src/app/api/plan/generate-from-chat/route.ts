import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWeekStart, AGE_LABELS } from "@/lib/utils";
import Anthropic from "@anthropic-ai/sdk";

const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "dummy";

// 年齢別モックプラン
function getMockPlan(formatType: string) {
  const isYoung = formatType === "young"; // 0-2歳
  if (isYoung) {
    return {
      targetAge: 1,
      formatType: "young",
      goal: "【養護のねらい】\n・一人一人の生活リズムを大切にしながら、安心して過ごせるようにする\n・スキンシップを通して情緒の安定を図る\n\n【教育のねらい】\n・保育者や友だちの動きに興味をもち、模倣しながら関わろうとする\n・身近な素材に触れ、感触を楽しむ",
      content: "・個々の睡眠・食事リズムに合わせた保育を行う\n・わらべうた・ふれあい遊びで保育者との関係を深める\n・砂・水・粘土などの感触遊びを楽しむ\n・絵本の読み聞かせを通して言葉と絵への興味を育てる",
      environment: "・安全で清潔な環境を整え、探索できるスペースを確保する\n・感触素材（砂・水・スライムなど）を安全に使えるよう準備する\n・絵本コーナーを低い位置に設置し、自由に手に取れるようにする",
      support: "・一人一人の発達段階に合わせて関わり、無理な促しはしない\n・「○○だね」「いい感じだね」と言葉を添えながらスキンシップをとる\n・トラブルには素早く介入し、安心できる場所を提供する\n・個別の配慮事項を職員間で共有し、一貫した関わりをする",
      guidelineRef: "保育所保育指針 第2章 1歳以上3歳未満児の保育 ①養護（生命の保持・情緒の安定）②教育（健康・人間関係・環境・言葉・表現）",
    };
  }
  return {
    targetAge: 3,
    formatType: "standard",
    goal: "・友だちと一緒に体を動かして遊ぶ楽しさを十分に味わう\n・身近な素材に興味をもち、自分なりに試したり工夫したりしようとする\n・保育者や友だちとのやり取りを通して、言葉で気持ちを表現しようとする",
    content: "・戸外で砂場・固定遊具など体を十分に動かす遊びを楽しむ\n・自然物（砂・葉・石）を使った造形・見立て遊びを行う\n・製作コーナーで糊やハサミを使い、自分のペースで制作を進める\n・グループでの絵本タイムを設け、物語の世界を共有する",
    environment: "・砂場用具を十分に用意し、友だちと共有できる量を確保する\n・製作コーナーに糊・色紙・廃材を整理して置き、子どもが自由に使えるようにする\n・絵本コーナーに季節の本を加え、手に取りやすいよう低い棚に陳列する",
    support: "・子ども同士のやり取りを温かく見守り、必要なときだけ介入する\n・トラブル時は双方の気持ちを代弁し、言葉で伝えられるよう促す\n・「どうしたいの？」と問いかけ、子ども自身が解決策を見つける過程を大切にする\n・活動の切り替えには予告を入れ、見通しをもって動けるよう配慮する",
    guidelineRef: "保育所保育指針 第2章 3歳以上児の保育 ②ねらい及び内容（ア）健康、（イ）人間関係、（エ）表現",
  };
}

// 年齢別・フォーマット別システムプロンプト
function buildGeneratePrompt(formatType: string): string {
  const base = `あなたは経験豊富な保育主任です。
保育士との対話記録をもとに、週案を作成してください。

【準拠文書】
- 保育所保育指針（厚生労働省・2018年改定）
- 保育所保育指針解説（厚生労働省・2018年）
- 幼保連携型認定こども園教育・保育要領解説（内閣府・文部科学省・厚生労働省・2018年）

【重要ルール】
- 対話から年齢・子どもの様子・環境・援助・来週のねらいを読み取る
- 年齢に合った発達段階の文言を必ず使う
- 保育士らしい自然で具体的な文体
- 固有名詞（人名・園名）は使わない
- 箇条書きで読みやすく（各項目を「・」で始める）`;

  if (formatType === "young") {
    return base + `

【0〜2歳児専用フォーマット】
この年齢では養護と教育を分けて記述してください。
個別の発達差が大きいため「一人一人」「個々の」という視点を必ず含めること。

以下のJSON形式のみで出力（前後のマークダウン不要）：
{
  "targetAge": 数値（0〜2）,
  "formatType": "young",
  "goal": "【養護のねらい】\\n・...\\n\\n【教育のねらい】\\n・...",
  "content": "・...",
  "environment": "・...",
  "support": "・...（個別配慮の視点を含める）",
  "guidelineRef": "保育所保育指針 第2章 1歳以上3歳未満児の保育..."
}`;
  }

  if (formatType === "yochien") {
    return base + `

【幼保連携型認定こども園フォーマット】
教育・保育要領解説の視点（育みたい資質・能力、幼児期の終わりまでに育ってほしい姿）を意識してください。

以下のJSON形式のみで出力（前後のマークダウン不要）：
{
  "targetAge": 数値（3〜5）,
  "formatType": "yochien",
  "goal": "・...（資質・能力の視点を含む）",
  "content": "・...",
  "environment": "・...",
  "support": "・...",
  "guidelineRef": "幼保連携型認定こども園教育・保育要領解説 第2章..."
}`;
  }

  // standard (3-5歳 保育所)
  return base + `

【3〜5歳児標準フォーマット（保育所）】
5領域（健康・人間関係・環境・言葉・表現）から適切なものを選んでねらいを立ててください。
集団での育ちと主体的な遊びの視点を大切にしてください。

以下のJSON形式のみで出力（前後のマークダウン不要）：
{
  "targetAge": 数値（3〜5）,
  "formatType": "standard",
  "goal": "・...",
  "content": "・...",
  "environment": "・...",
  "support": "・...",
  "guidelineRef": "保育所保育指針 第2章 3歳以上児の保育..."
}`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, formatType = "standard" } = await req.json() as {
    messages: { role: string; content: string }[];
    formatType?: string;
  };

  const conversationText = messages
    .map(m => `${m.role === "user" ? "保育士" : "AI"}: ${m.content}`)
    .join("\n\n");

  if (isMock) {
    await new Promise(r => setTimeout(r, 2000));
    const mock = getMockPlan(formatType);
    const plan = await db.weeklyPlan.create({
      data: {
        userId: session.user.id,
        weekStartDate: getWeekStart(),
        targetAge: mock.targetAge,
        rawMemo: conversationText,
        goal: mock.goal,
        content: mock.content,
        environment: mock.environment,
        support: mock.support,
        guidelineRef: mock.guidelineRef,
      },
    });
    return NextResponse.json({ id: plan.id, ...mock });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    system: buildGeneratePrompt(formatType),
    messages: [
      {
        role: "user",
        content: `以下の対話記録から週案を作成してください：\n\n${conversationText}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const planData = JSON.parse(text);

  const plan = await db.weeklyPlan.create({
    data: {
      userId: session.user.id,
      weekStartDate: getWeekStart(),
      targetAge: planData.targetAge ?? 3,
      rawMemo: conversationText,
      goal: planData.goal,
      content: planData.content,
      environment: planData.environment,
      support: planData.support,
      guidelineRef: planData.guidelineRef,
    },
  });

  return NextResponse.json({ id: plan.id, ...planData });
}
