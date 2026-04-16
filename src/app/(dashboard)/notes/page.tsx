import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatWeekRange, AGE_GROUP_LABELS } from "@/lib/utils";
import type { AgeGroup } from "@prisma/client";

export const metadata: Metadata = { title: "週案一覧" };

export default async function NotesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const notes = await db.weeklyNote.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { weekStart: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">週案一覧</h1>
          <p className="text-sm text-gray-500 mt-1">作成した週案を確認・編集できます</p>
        </div>
        <Link
          href="/notes/new"
          className="bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors"
        >
          ✍️ 新しい週案を作成
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-medium mb-1">まだ週案がありません</p>
          <p className="text-sm text-gray-400 mb-6">
            今週の子どもたちの様子を入力して、AIに指導計画を作成してもらいましょう。
          </p>
          <Link
            href="/notes/new"
            className="inline-block bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            最初の週案を作成する
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {note.ageGroup && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {AGE_GROUP_LABELS[note.ageGroup as AgeGroup]}
                      </span>
                    )}
                    {note.plan && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        note.plan.visibility === "PUBLIC"
                          ? "bg-blue-100 text-blue-700"
                          : note.plan.visibility === "MEMBERS_ONLY"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {note.plan.visibility === "PUBLIC"
                          ? "公開"
                          : note.plan.visibility === "MEMBERS_ONLY"
                          ? "会員限定"
                          : "非公開"}
                      </span>
                    )}
                    {!note.plan && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        生成失敗
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {formatWeekRange(note.weekStart)}の週案
                  </p>
                  {note.plan && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {note.plan.aims.split("\n")[0]}
                    </p>
                  )}
                  {note.theme.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {note.theme.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                      {note.theme.length > 4 && (
                        <span className="text-xs text-gray-400">+{note.theme.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-gray-300 text-lg">›</span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
