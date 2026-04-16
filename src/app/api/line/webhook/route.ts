import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { replyText } from "@/lib/line";
import { validateSignature } from "@/lib/line";
import type { webhook } from "@line/bot-sdk";
type WebhookRequestBody = webhook.CallbackRequest;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  // 署名検証
  const isValid = validateSignature(
    rawBody,
    process.env.LINE_CHANNEL_SECRET ?? "",
    signature
  );
  if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const body = JSON.parse(rawBody) as WebhookRequestBody;

  for (const event of body.events) {
    if (
      event.type !== "message" ||
      event.message.type !== "text" ||
      !("replyToken" in event)
    ) continue;

    const lineUserId = event.source?.userId;
    if (!lineUserId || typeof lineUserId !== "string") continue;

    const text = event.message.text.trim();
    const replyToken = "replyToken" in event ? (event.replyToken as string) : null;
    if (!replyToken) continue;

    // LINE連携済みユーザーか確認
    const linked = await db.lineUser.findUnique({
      where: { lineUserId },
      include: { user: true },
    });

    if (!linked) {
      // 連携コードか確認
      const codeRecord = await db.lineLinkCode.findFirst({
        where: {
          code: text,
          expiresAt: { gt: new Date() },
        },
      });

      if (codeRecord) {
        // 連携を保存
        await db.lineUser.create({
          data: { userId: codeRecord.userId, lineUserId },
        });
        await db.lineLinkCode.delete({ where: { id: codeRecord.id } });
        await replyText(replyToken, "✅ HoikuNoteと連携しました！\nLINEにメモを送るだけで保存されます。");
      } else {
        const appUrl = process.env.NEXTAUTH_URL ?? "https://hoikunote.app";
        await replyText(replyToken, `HoikuNoteと連携してください\n${appUrl}/profile`);
      }
      continue;
    }

    // メモ保存
    const memoCount = await db.dailyMemo.count({
      where: {
        userId: linked.userId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    await db.dailyMemo.create({
      data: { userId: linked.userId, content: text, source: "line" },
    });

    await replyText(replyToken, `メモを保存しました ✓ 今週${memoCount + 1}件`);
  }

  return NextResponse.json({ ok: true });
}
