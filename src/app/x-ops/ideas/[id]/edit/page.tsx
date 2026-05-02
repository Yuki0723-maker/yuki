import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { IdeaForm } from "@/components/x-ops/IdeaForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditIdeaPage({ params }: Props) {
  const { id } = await params;

  const idea = await db.xPostIdea.findUnique({ where: { id } });
  if (!idea) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/x-ops/ideas/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">アイデアを編集</h1>
      </div>
      <IdeaForm
        ideaId={id}
        defaultValues={{ title: idea.title, memo: idea.memo, tags: idea.tags }}
      />
    </div>
  );
}
