import { IdeaForm } from "@/components/x-ops/IdeaForm";

export const metadata = { title: "アイデアを追加 | X 運用サポート" };

export default function NewIdeaPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">アイデアを追加</h1>
        <p className="text-sm text-gray-500 mt-1">投稿したいテーマやネタを記録しましょう</p>
      </div>
      <IdeaForm />
    </div>
  );
}
