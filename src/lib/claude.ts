import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

const TEMPLATE_SYSTEM_PROMPT = `あなたは帳票レイアウト解析の専門家です。
保育園の指導計画フォーマット（PDFのテキスト抽出結果）を読み取り、
各フィールドの位置と役割を特定してください。

以下のJSONフォーマットのみで出力してください：
{
  "paperSize": "A4",
  "orientation": "portrait",
  "fields": {
    "title":       { "label": "書類タイトル", "region": "top" },
    "weekDate":    { "label": "週の日付欄", "region": "header" },
    "targetAge":   { "label": "対象年齢欄", "region": "header" },
    "goal":        { "label": "ねらい欄", "region": "body", "order": 1 },
    "content":     { "label": "内容欄", "region": "body", "order": 2 },
    "environment": { "label": "環境構成欄", "region": "body", "order": 3 },
    "support":     { "label": "保育者の援助欄", "region": "body", "order": 4 },
    "reflection":  { "label": "振り返り欄（あれば）", "region": "footer" }
  },
  "notes": "特記事項"
}`;

export interface GeneratedPlan {
  goal: string;
  content: string;
  environment: string;
  support: string;
  guidelineRef: string;
}

export async function generateWeeklyPlan(params: {
  age: number;
  maskedMemo: string;
  nextWeekMemo?: string;
}): Promise<GeneratedPlan> {
  const { age, maskedMemo, nextWeekMemo } = params;

  const userMessage = `対象年齢：${age}歳児
今週の子どもの様子：
${maskedMemo}
${nextWeekMemo ? `\n来週に向けて：\n${nextWeekMemo}` : ""}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: PLAN_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as GeneratedPlan;
}

export interface TemplateLayout {
  paperSize: string;
  orientation: string;
  fields: Record<string, { label: string; region: string; order?: number }>;
  notes: string;
}

export async function analyzeTemplateLayout(pdfText: string): Promise<TemplateLayout> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: TEMPLATE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `以下はPDFから抽出したテキストです。レイアウトを解析してください：\n\n${pdfText}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  return JSON.parse(text) as TemplateLayout;
}
