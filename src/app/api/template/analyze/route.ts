import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeTemplateLayout } from "@/lib/claude";
import { uploadTemplatePdf } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string;

  if (!file) return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // pdf-parse でテキスト抽出
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
  const { text: pdfText } = await pdfParse(buffer);

  // Supabase Storage にアップロード
  const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
  const pdfUrl = await uploadTemplatePdf(buffer, fileName);

  // Claude API でレイアウト解析
  const layout = await analyzeTemplateLayout(pdfText);

  // DBに保存
  const template = await db.planTemplate.create({
    data: {
      userId: session.user.id,
      name: name || file.name,
      originalPdfUrl: pdfUrl,
      layoutJson: JSON.stringify(layout),
    },
  });

  return NextResponse.json({ id: template.id, name: template.name, layout });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await db.planTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(templates);
}
