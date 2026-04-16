import Anthropic from "@anthropic-ai/sdk";
import type { AgeGroup } from "@prisma/client";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  AGE_0: "0歳児",
  AGE_1: "1歳児",
  AGE_2: "2歳児",
  AGE_3: "3歳児",
  AGE_4: "4歳児",
  AGE_5: "5歳児",
  MIXED: "縦割り保育",
};

const SYSTEM_PROMPT = `あなたは保育の専門家です。「保育所保育指針」（厚生労働省）および「幼保連携型認定こども園教育・保育要領」に基づいた指導計画を作成します。

## 作成原則
- 子ども主体の保育観を反映した文言を使用する
- 「子どもが〜できるよう」「子どもの〜を大切にしながら」など、子どもの主体性・自発性を尊重する表現を用いる
- 保育者は「援助者」「環境を構成する者」として記述する
- 保育所保育指針の5領域（健康・人間関係・環境・言葉・表現）を意識した内容にする
- 発達段階に応じた具体的な内容・援助を記述する

## 出力形式
必ず以下のJSON形式で出力すること：

{
  "aims": "ねらい（箇条書き、2〜3項目）",
  "content": "内容（具体的な活動内容、3〜5項目）",
  "support": "保育者の援助（具体的な援助方法、3〜5項目）",
  "environment": "環境構成（物的・人的・空間的環境、2〜4項目）"
}

各項目は改行区切りの箇条書きで記述すること。JSONのみを返し、マークダウンのコードブロックは使わないこと。`;

export interface PlanContent {
  aims: string;
  content: string;
  support: string;
  environment: string;
}

export async function generatePlan(params: {
  weeklyContent: string;
  ageGroup?: AgeGroup | null;
  season?: string | null;
  themes?: string[];
}): Promise<PlanContent> {
  const { weeklyContent, ageGroup, season, themes } = params;

  const ageLabel = ageGroup ? AGE_GROUP_LABELS[ageGroup] : "指定なし";
  const seasonLabel = season ?? "指定なし";
  const themeLabel = themes && themes.length > 0 ? themes.join("、") : "なし";

  const userMessage = `以下の週の様子をもとに、今週の指導計画を作成してください。

【対象年齢】${ageLabel}
【季節】${seasonLabel}
【テーマ・キーワード】${themeLabel}

【週の様子メモ】
${weeklyContent}

上記の内容を踏まえ、保育所保育指針に準拠した指導計画（ねらい・内容・保育者の援助・環境構成）をJSON形式で作成してください。`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  const parsed = JSON.parse(text) as PlanContent;
  return parsed;
}
