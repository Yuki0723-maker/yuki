import type { Metadata } from "next";
import { CommunityPostForm } from "@/components/community/CommunityPostForm";

export const metadata: Metadata = { title: "投稿する" };

export default function CommunityNewPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿する</h1>
        <p className="text-sm text-gray-500 mt-1">
          活動アイデアや保育の悩みを全国の保育士と共有しましょう。
        </p>
      </div>
      <CommunityPostForm />
    </div>
  );
}
