import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 連携コード発行
export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分

  await db.lineLinkCode.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, code, expiresAt },
    update: { code, expiresAt },
  });

  return NextResponse.json({ code });
}

// 連携状態取得
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lineUser = await db.lineUser.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ linked: !!lineUser });
}

// 連携解除
export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.lineUser.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
