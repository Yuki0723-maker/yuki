import Anthropic from "@anthropic-ai/sdk";
import { AGE_LABELS } from "./utils";

export interface GeneratedPlan {
  goal: string;
  content: string;
  environment: string;
  support: string;
  guidelineRef: string;
}

export interface TemplateLayout {
  paperSize: string;
  orientation: string;
  fields: Record<string, { label: string; region: string; order?: number }>;
  notes: string;
}

// APIキーが "dummy" または未設定の場合はモックを返す
const isMock = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "dummy";

function mockPlan(age: number, memo: string): GeneratedPlan {
  const ageLabel = AGE_LABELS[age] ?? `${age}歳児`;
  return {
    goal: `・${ageLabel}の子どもが友だちと関わりながら、思いきり体を動かして遊ぶ楽しさを味わう\n・身近な自然物や素材に興味をもち、自分なりに試したり工夫したりしようとする\n・保育者や友だちとのやり取りを通して、言葉で気持ちを表現しようとする`,
    content: `・戸外で砂場・固定遊具・追いかけっこなど、体を十分に動かす遊びを楽しむ\n・自然物（砂・葉・石）を使った造形・見立て遊びを行う\n・製作コーナーで糊やハサミを使い、自分のペースで制作を進める\n・グループでの絵本タイムを設け、物語の世界を共有する`,
    environment: `・砂場用具（バケツ・型抜き・シャベル）を十分に用意し、友だちと共有できる量を確保する\n・製作コーナーに糊・色紙・廃材を整理して置き、子どもが自由に使えるようにする\n・トラブルになりやすい場所には保育者が位置取りし、安心して遊べる空間を作る\n・絵本コーナーに季節の本を加え、子どもが手に取りやすいよう低い棚に陳列する`,
    support: `・${memo.slice(0, 30).replace(/\n/g, "、")}という様子を踏まえ、子ども同士のやり取りを温かく見守る\n・友だちとのトラブル時は双方の気持ちを代弁し、自分の言葉で伝えられるよう促す\n・製作で困っている子には「どうしたいの？」と問いかけ、自分で解決策を見つける過程を大切にする\n・活動の切り替えには予告を入れ、子どもが見通しをもって動けるよう配慮する`,
    guidelineRef: `保育所保育指針 第2章 ${ageLabel}の保育 ②ねらい及び内容（エ）表現、（ア）健康`,
  };
}

const PLAN_SYSTEM_PROMPT = `あなたは経験豊富な保育士・保育主任です。
以下のルールに従って週案を作成してください。

【準拠する文書】
- 保育所保育指針（厚生労働省・2018年改定）
- 幼保連携型認定こども園教育・保育要領（2018年改定）

【出力ルール】
- 対象年齢に合った発達段階の文言を使うこと
- 保育士らしい自然な文体で書くこと
- 固有名詞（人名・園名）は出力に含めないこと
- 以下のJSON形式のみで出力すること（前後のマークダウン・説明文不要）

{
  "goal": "ねらいの文章",
  "content": "内容の文章",
  "environment": "環境構成の文章",
  "support": "保育者の援助の文章",
  "guidelineRef": "保育所保育指針 第2章 ○歳児 ○○に関する記述"
}`;

export async function generateWeeklyPlan(params: {
  age: number;
  maskedMemo: string;
  nextWeekMemo?: string;
}): Promise<GeneratedPlan> {
  const { age, maskedMemo, nextWeekMemo } = params;

  if (isMock) {
    // デモ用：1秒待ってモックデータを返す
    await new Promise((r) => setTimeout(r, 1500));
    return mockPlan(age, maskedMemo);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userMessage = `対象年齢：${age}歳児\n今週の子どもの様子：\n${maskedMemo}${nextWeekMemo ? `\n\n来週に向けて：\n${nextWeekMemo}` : ""}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as GeneratedPlan;
}

export async function analyzeTemplateLayout(pdfText: string): Promise<TemplateLayout> {
  if (isMock) {
    return {
      paperSize: "A4",
      orientation: "portrait",
      fields: {
        goal: { label: "ねらい欄", region: "body", order: 1 },
        content: { label: "内容欄", region: "body", order: 2 },
        environment: { label: "環境構成欄", region: "body", order: 3 },
        support: { label: "保育者の援助欄", region: "body", order: 4 },
      },
      notes: "デモ用モックレイアウト",
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `あなたは帳票レイアウト解析の専門家です。保育園の指導計画フォーマットを解析し、JSONのみで出力してください。`,
    messages: [{ role: "user", content: `以下はPDFテキストです：\n\n${pdfText}` }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as TemplateLayout;
}
