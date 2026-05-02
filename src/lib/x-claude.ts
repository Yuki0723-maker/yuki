import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type XPostTone = "casual" | "professional" | "educational" | "engaging";

const TONE_LABELS: Record<XPostTone, string> = {
  casual: "カジュアル・親しみやすい",
  professional: "プロフェッショナル・信頼感",
  educational: "教育的・情報提供",
  engaging: "エンゲージメント重視・共感",
};

const TONE_INSTRUCTIONS: Record<XPostTone, string> = {
  casual: "親しみやすい口語体で、絵文字を適度に使い、フォロワーが気軽に反応したくなる文体で書く。",
  professional: "信頼感のある丁寧な言葉遣いで、専門性を感じさせながらも読みやすい文体で書く。絵文字は最小限に。",
  educational: "情報の価値が伝わるよう、具体的な知識・ノウハウを箇条書きや番号付きリストを活用して整理して書く。",
  engaging: "共感を呼ぶ問いかけや感情に訴える表現を使い、リプライやRTを促す文体で書く。絵文字で感情を強調する。",
};

const SYSTEM_PROMPT = `あなたはXの投稿文を作成するプロのSNSコピーライターです。

## 制約
- 投稿文は140文字以内（日本語）に収める
- ハッシュタグは最大3つまで
- URLは含めない
- 読んだ人が価値を感じ、いいね・RT・コメントしたくなる内容にする

## 出力形式
必ず以下のJSON形式で3パターンの投稿文を出力すること：

{
  "posts": [
    { "text": "投稿文1（ハッシュタグ含む）", "chars": 文字数 },
    { "text": "投稿文2（ハッシュタグ含む）", "chars": 文字数 },
    { "text": "投稿文3（ハッシュタグ含む）", "chars": 文字数 }
  ]
}

JSONのみを返し、マークダウンのコードブロックは使わないこと。`;

export interface XGeneratedPostContent {
  text: string;
  chars: number;
}

export async function generateXPosts(params: {
  title: string;
  memo: string;
  tags: string[];
  tone: XPostTone;
}): Promise<XGeneratedPostContent[]> {
  const { title, memo, tags, tone } = params;

  const tagsLabel = tags.length > 0 ? tags.join("、") : "なし";

  const userMessage = `以下のアイデアをもとに、Xの投稿文を3パターン作成してください。

【トーン】${TONE_LABELS[tone]}
${TONE_INSTRUCTIONS[tone]}

【アイデアタイトル】${title}
【詳細メモ】${memo}
【関連タグ・キーワード】${tagsLabel}

上記をもとに、140文字以内のX投稿文を3パターンJSON形式で出力してください。`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  const parsed = JSON.parse(text) as { posts: XGeneratedPostContent[] };
  return parsed.posts;
}
