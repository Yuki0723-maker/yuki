import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getWeekStart } from "@/lib/utils";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const hasGroq      = !!(process.env.GROQ_API_KEY      && process.env.GROQ_API_KEY      !== "dummy");
const hasGemini    = !!(process.env.GEMINI_API_KEY    && process.env.GEMINI_API_KEY    !== "dummy");
const hasOpenAI    = !!(process.env.OPENAI_API_KEY    && process.env.OPENAI_API_KEY    !== "dummy");
const hasAnthropic = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "dummy");
const isMock = !hasGroq && !hasGemini && !hasOpenAI && !hasAnthropic;

function getMockPlan(formatType: string) {
  if (formatType === "young") {
    return {
      targetAge: 1,
      formatType: "young",
      goal: "【養護のねらい】\n・一人一人の生活リズムを大切にしながら、安心して過ごせるようにする\n・スキンシップを通して情緒の安定を図る\n\n【教育のねらい】\n・保育者や友だちの動きに興味をもち、模倣しながら関わろうとする\n・身近な素材に触れ、感触を楽しむ",
      content: "・個々の睡眠・食事リズムに合わせた保育を行う\n・わらべうた・ふれあい遊びで保育者との関係を深める\n・砂・水・粘土などの感触遊びを楽しむ",
      environment: "・安全で清潔な環境を整え、探索できるスペースを確保する\n・感触素材（砂・水）を安全に使えるよう準備する",
      support: "・一人一人の発達段階に合わせて関わり、無理な促しはしない\n・「○○だね」と言葉を添えながらスキンシップをとる",
      guidelineRef: "保育所保育指針 第2章 1歳以上3歳未満児の保育 ①養護②教育",
    };
  }
  return {
    targetAge: 3,
    formatType: "standard",
    goal: "・友だちと一緒に体を動かして遊ぶ楽しさを十分に味わう\n・身近な素材に興味をもち、自分なりに試したり工夫したりしようとする",
    content: "・戸外で砂場・固定遊具など体を十分に動かす遊びを楽しむ\n・自然物（砂・葉・石）を使った造形・見立て遊びを行う",
    environment: "・砂場用具を十分に用意し、友だちと共有できる量を確保する\n・製作コーナーに糊・色紙・廃材を整理して置く",
    support: "・子ども同士のやり取りを温かく見守り、必要なときだけ介入する\n・トラブル時は双方の気持ちを代弁し、言葉で伝えられるよう促す",
    guidelineRef: "保育所保育指針 第2章 3歳以上児の保育 ②ねらい及び内容（ア）健康、（イ）人間関係",
  };
}

function buildGeneratePrompt(formatType: string): string {
  const base = `あなたは経験豊富な保育主任です。
保育士との対話記録をもとに、週案を作成してください。

【準拠文書】
- 保育所保育指針（厚生労働省・2018年改定）
- 保育所保育指針解説（厚生労働省・2018年）
- 幼保連携型認定こども園教育・保育要領解説（2018年）

【週案作成の思考プロセス（必ず順番に行うこと）】
ステップ1【子どもの姿の抽出】
対話記録から「子どもが実際にしていたこと・言っていたこと・感じていたこと」を具体的に拾い出す。
例：「砂山を友だちと一緒に作った」「うまくいかなくて泣いていた」「虫を見つけて大きな声で呼んでいた」

ステップ2【発達の視点で整理】
拾い出した姿を発達理論の視点で意味づける。
「この姿はどの発達段階に位置するか」「何を獲得しようとしているか」「集団・個の視点からどう見えるか」を考える。

ステップ3【ねらいの導出】
ステップ1・2をもとに、来週の保育で大切にしたいことを言語化する。
「〜しようとする」「〜を楽しむ」「〜に気づく」「〜を通して〜を感じる」などの文型を使う。

【重要ルール】
- 上記ステップを経てから各フィールドを書く
- 年齢に合った発達段階の文言を必ず使う（後述の年齢別ガイドを参照）
- 保育士らしい自然で具体的な文体
- 固有名詞（人名・園名）は使わない
- 箇条書きで読みやすく（各項目を「・」で始める）
- 必ずJSONのみで出力（前後の説明・マークダウン不要）`;

  if (formatType === "young") {
    return base + `

【0〜2歳児の発達言語ガイド】
この年齢の子どもは「感覚・運動・愛着」が発達の中心です。
使うべき文言：
- 「一人一人の生活リズムを大切に」「個々のペースに合わせて」
- 「保育者との愛着関係を基盤に」「安心できる環境の中で」
- 「感触を楽しむ」「体を使って探索する」「模倣する」「指差しで伝える」
- 「情緒の安定」「自分への信頼感」「身近な大人への信頼」
養護（生命の保持・情緒の安定）と教育（5領域の芽生え）を必ず分けて記述する。

【保育者の援助：具体的な言動を書く】
×「温かく見守る」← 抽象的でNG
○「『〜だね』と子どもの行動を言葉にして返す」← 具体的でOK
○「泣いているときはすぐに抱き上げ、『〜が嫌だったね』と気持ちを代弁する」
○「〜に触れる機会をつくり、『冷たいね』『ふわふわだね』と感触を言葉にする」
○「子どもが指差した方向を一緒に見て、『〜があるね』と共感する」

【0〜2歳児専用フォーマット】
養護と教育を分けて記述。「一人一人」「個々の」の視点を必ず含める。

{"targetAge":数値,"formatType":"young","goal":"【養護のねらい】\\n・...\\n\\n【教育のねらい】\\n・...","content":"・...","environment":"・...","support":"・...","guidelineRef":"保育所保育指針 第2章 1歳以上3歳未満児の保育"}`;
  }

  if (formatType === "yochien") {
    return base + `

【3〜5歳児（認定こども園）の発達言語ガイド】
この年齢の子どもは「主体性・協同・思考・表現」が発達の中心です。
使うべき文言：
- 「自分なりに考えながら」「友だちと力を合わせて」「試行錯誤しながら」
- 「遊びの中で気づく」「イメージを広げながら」「ルールを守って」
- 「育みたい資質・能力（知識・技能の基礎、思考・判断・表現、学びに向かう力）」
- 「幼児期の終わりまでに育ってほしい姿（10の姿）」を意識した文言

【保育者の援助：具体的な言動を書く】
×「支援する」「関わる」← 抽象的でNG
○「子どもが『どうしてかな？』と疑問をもてるよう、答えを言わずに『どう思う？』と問い返す」
○「友だちとの意見の違いに気づけるよう、双方の言葉を繰り返して聞かせる」
○「〜の場面では介入せず遠くから見守り、助けを求めてきたときだけ応じる」
○「子どもの言葉を『〜ということ？』と言い直して、考えを深める機会にする」

【幼保連携型認定こども園フォーマット】
育みたい資質・能力、幼児期の終わりまでに育ってほしい姿を意識。

{"targetAge":数値,"formatType":"yochien","goal":"・...","content":"・...","environment":"・...","support":"・...","guidelineRef":"幼保連携型認定こども園教育・保育要領解説 第2章"}`;
  }

  return base + `

【3〜5歳児の発達言語ガイド】
この年齢の子どもは「主体性・協同・言語・象徴機能」が発達の中心です。
使うべき文言：
- 「友だちと一緒に考えながら」「自分なりに工夫して」「試しながら」
- 「遊びの中で」「自発的に」「主体的に」
- 5領域を意識：健康（体を動かす喜び）、人間関係（友だちとの関わり）、環境（不思議さ・気づき）、言葉（伝え合い）、表現（感じたことを表す）

【保育者の援助：具体的な言動を書く】
×「見守る」「声をかける」← 抽象的でNG
○「子どもが自分で気づけるよう、答えを言わずに『どうしたらいいと思う？』と問いかける」
○「トラブルの場面では、両方の子の言葉を代弁し『〜という気持ちだったんだね』と整理する」
○「〜が難しそうな場面では、隣で同じ動きをしながら手本を見せ、できたらすぐに認める」
○「友だちの工夫に気づかせるため、『〇〇ちゃんはどうやったか見てみよう』と声をかける」
○「子どもの発言を『〜ということ？』と繰り返して確認し、思考を深める機会にする」

【3〜5歳児標準フォーマット（保育所）】
5領域（健康・人間関係・環境・言葉・表現）から適切なものを選んでねらいを立てる。

{"targetAge":数値,"formatType":"standard","goal":"・...","content":"・...","environment":"・...","support":"・...","guidelineRef":"保育所保育指針 第2章 3歳以上児の保育"}`;
}

async function callAI(systemPrompt: string, userContent: string): Promise<string> {
  // Groq
  if (hasGroq) {
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });
    return res.choices[0]?.message?.content ?? "{}";
  }

  // Gemini
  if (hasGemini) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userContent);
    return result.response.text();
  }

  // OpenAI
  if (hasOpenAI) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });
    return res.choices[0]?.message?.content ?? "{}";
  }

  // Anthropic
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "{}";
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

  // モック
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

  try {
    const rawText = await callAI(
      buildGeneratePrompt(formatType),
      `以下の対話記録から週案を作成してください：\n\n${conversationText}`
    );

    // JSON部分だけ抽出（AIがマークダウンで囲む場合の対策）
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const planData = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    const plan = await db.weeklyPlan.create({
      data: {
        userId: session.user.id,
        weekStartDate: getWeekStart(),
        targetAge: planData.targetAge ?? 3,
        rawMemo: conversationText,
        goal: planData.goal ?? "",
        content: planData.content ?? "",
        environment: planData.environment ?? "",
        support: planData.support ?? "",
        guidelineRef: planData.guidelineRef ?? "",
      },
    });

    return NextResponse.json({ id: plan.id, ...planData });
  } catch (e) {
    console.error("週案生成エラー:", e);
    return NextResponse.json({ error: "週案の生成に失敗しました" }, { status: 500 });
  }
}
