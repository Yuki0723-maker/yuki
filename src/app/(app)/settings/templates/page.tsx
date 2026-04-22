import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TemplateManager } from "@/components/plan/TemplateManager";

export const metadata: Metadata = { title: "フォーマット管理" };

export default async function TemplatesPage() {
  const session = await auth();

  const templates = await db.planTemplate.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">フォーマット管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          園のフォーマットPDFをアップロードすると、AIがレイアウトを解析してPDF出力に使えます。
        </p>
      </div>
      <TemplateManager templates={templates} />
    </div>
  );
}
