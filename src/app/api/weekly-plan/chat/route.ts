import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { buildWeeklyPlanSystemPrompt } from "@/lib/build-system-prompt"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { GoogleGenerativeAI } from "@google/generative-ai"

const hasGroq      = !!(process.env.GROQ_API_KEY      && process.env.GROQ_API_KEY      !== "dummy")
const hasGemini    = !!(process.env.GEMINI_API_KEY    && process.env.GEMINI_API_KEY    !== "dummy")
const hasOpenAI    = !!(process.env.OPENAI_API_KEY    && process.env.OPENAI_API_KEY    !== "dummy")
const hasAnthropic = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "dummy")
const isMock = !hasGroq && !hasGemini && !hasOpenAI && !hasAnthropic

const encoder = new TextEncoder()

function mockResponse(userMsgCount: number): string {
  const responses = [
    "先週のクラスの様子を教えてください。子どもたちはどんな遊びをしていましたか？",
    "そうだったんですね！そのとき子どもたちはどんな言葉や表情でしたか？何か印象的なやりとりはありましたか？",
    "具体的に教えてくれてありがとうございます。その場面で先生はどんなふうに関わりましたか？また、うまくいかなかった場面や困ったことはありましたか？",
    "よく見ていらっしゃいますね。それをふまえて、先週の子どもたちの姿をまとめてみます。\n\n---提案---\n【前週の子どもの姿】\n・砂場で友だちと山や川を作るなど、一緒にイメージを共有しながら遊ぶ姿が見られた\n・うまくいかない場面でも「もう一回やってみる」と繰り返し試みる姿があった\n----------\n\nこの内容でよさそうですか？修正したい点はありますか？",
    "わかりました！では今週のねらいに移りましょう。今週、子どもたちに特に大切にしてほしいことや、経験してほしいことはありますか？",
    "なるほど。その「経験してほしいこと」について、具体的にどんな場面を想定していますか？",
    "ありがとうございます。では今週のねらいを提案します。\n\n---提案---\n【今週のねらい】\n・友だちと力を合わせながら、共通のイメージを持って遊ぶことを楽しむ\n・自分の思いを言葉で伝えながら、相手の気持ちにも気づこうとする\n----------\n\nこの内容でよさそうですか？",
  ]
  return responses[Math.min(userMsgCount, responses.length - 1)]
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { messages } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[]
  }

  const config = await db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  })
  if (!config) return NextResponse.json({ error: "Format config not found" }, { status: 404 })

  const systemPrompt = buildWeeklyPlanSystemPrompt(config)
  const sseHeaders = { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }

  const chatMessages = messages.length === 0
    ? [{ role: "user" as const, content: "会話を始めてください" }]
    : messages

  if (isMock) {
    const userCount = messages.filter(m => m.role === "user").length
    const text = mockResponse(userCount)
    const stream = new ReadableStream({
      async start(controller) {
        for (const char of text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: char })}\n\n`))
          await new Promise(r => setTimeout(r, 15))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })
    return new Response(stream, { headers: sseHeaders })
  }

  if (hasGroq) {
    const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 800,
            messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
            stream: true,
          })
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "エラーが発生しました"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })
    return new Response(stream, { headers: sseHeaders })
  }

  if (hasGemini) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite", systemInstruction: systemPrompt })
    const contents = chatMessages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({ contents })
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "エラーが発生しました"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: msg })}\n\n`))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })
    return new Response(stream, { headers: sseHeaders })
  }

  if (hasOpenAI) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 800,
            messages: [{ role: "system", content: systemPrompt }, ...chatMessages],
            stream: true,
          })
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content ?? ""
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました" })}\n\n`))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
        controller.close()
      },
    })
    return new Response(stream, { headers: sseHeaders })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: systemPrompt,
          messages: chatMessages,
        })
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "エラーが発生しました" })}\n\n`))
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  })
  return new Response(stream, { headers: sseHeaders })
}
