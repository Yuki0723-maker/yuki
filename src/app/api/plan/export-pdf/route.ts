import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatWeekRange, AGE_LABELS } from "@/lib/utils";

// PDF生成HTML（デフォルトテンプレート）
function buildPlanHtml(plan: {
  weekStartDate: Date;
  targetAge: number;
  goal: string;
  content: string;
  environment: string;
  support: string;
  guidelineRef: string;
  templateLayoutJson?: string | null;
}): string {
  const fields = plan.templateLayoutJson
    ? (JSON.parse(plan.templateLayoutJson) as { fields: Record<string, { order?: number }> }).fields
    : null;

  const sections = [
    { key: "goal", label: "ねらい", value: plan.goal },
    { key: "content", label: "内容", value: plan.content },
    { key: "environment", label: "環境構成", value: plan.environment },
    { key: "support", label: "保育者の援助", value: plan.support },
  ];

  if (fields) {
    sections.sort((a, b) => (fields[a.key]?.order ?? 99) - (fields[b.key]?.order ?? 99));
  }

  const rows = sections.map(({ label, value }) => `
    <div class="section">
      <div class="section-label">${label}</div>
      <div class="section-value">${value.replace(/\n/g, "<br>")}</div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans JP', sans-serif; font-size: 11pt; color: #1a1a1a; padding: 20mm; }
  h1 { font-size: 14pt; font-weight: 700; text-align: center; margin-bottom: 12px; }
  .meta { display: flex; gap: 24px; margin-bottom: 16px; font-size: 10pt; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
  .section { border: 1px solid #ddd; margin-bottom: 8px; }
  .section-label { background: #f0fdf4; padding: 4px 12px; font-weight: 700; font-size: 10pt; border-bottom: 1px solid #ddd; }
  .section-value { padding: 8px 12px; min-height: 60px; line-height: 1.7; }
  .guideline { font-size: 8pt; color: #888; margin-top: 12px; text-align: right; }
</style>
</head>
<body>
  <h1>週案</h1>
  <div class="meta">
    <span>対象：${AGE_LABELS[plan.targetAge]}</span>
    <span>期間：${formatWeekRange(plan.weekStartDate)}</span>
  </div>
  ${rows}
  <div class="guideline">根拠：${plan.guidelineRef}</div>
</body>
</html>`;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { planId, templateId } = await req.json() as { planId: string; templateId?: string };

  const plan = await db.weeklyPlan.findUnique({
    where: { id: planId, userId: session.user.id },
    include: templateId ? { template: true } : undefined,
  });

  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const html = buildPlanHtml({
    ...plan,
    templateLayoutJson: (plan as { template?: { layoutJson?: string } }).template?.layoutJson ?? null,
  });

  // Puppeteerで PDF 生成
  // Vercel本番では @sparticuz/chromium-min を使うこと
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });
  await browser.close();

  return new Response(Buffer.from(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weekly-plan-${planId}.pdf"`,
    },
  });
}
