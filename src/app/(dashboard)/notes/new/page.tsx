import type { Metadata } from "next";
import { WeeklyNoteForm } from "@/components/notes/WeeklyNoteForm";

export const metadata: Metadata = { title: "週案を作成" };

export default function NewNotePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">週案を作成</h1>
        <p className="text-gray-500 mt-1 text-sm">
          今週の子どもたちの様子を自由に書いてください。AIが指導計画を自動作成します。
        </p>
      </div>
      <WeeklyNoteForm />
    </div>
  );
}
