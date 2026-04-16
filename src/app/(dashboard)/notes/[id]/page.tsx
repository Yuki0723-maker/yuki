import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatWeekRange, AGE_GROUP_LABELS } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";
import { PlanEditor } from "@/components/plans/PlanEditor";

export const metadata: Metadata = { title: "週案詳細" };

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const note = await db.weeklyNote.findUnique({
    where: { id, userId: session!.user.id },
    include: { plan: true },
  });

  if (!note) notFound();

  return (
    <div className="max-w-3xl">
      {/* Note header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {note.ageGroup && (
            <span className="bg-green-100 text-green-700 text-sm px-3 py-0.5 rounded-full font-medium">
              {AGE_GROUP_LABELS[note.ageGroup as AgeGroup]}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {formatWeekRange(note.weekStart)}の週案
          </h1>
        </div>
        {note.theme.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {note.theme.map((t) => (
              <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Original note */}
      <details className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl">
        <summary className="px-5 py-3 cursor-pointer text-sm font-medium text-amber-800 select-none">
          📝 入力した週の様子を見る
        </summary>
        <div className="px-5 pb-4">
          <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        </div>
      </details>

      {/* Plan */}
      {note.plan ? (
        <PlanEditor plan={note.plan} noteId={note.id} />
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-500 text-sm">
            指導計画の生成に失敗しました。
            <br />
            再度お試しください。
          </p>
        </div>
      )}
    </div>
  );
}
