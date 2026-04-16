import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/ui/SettingsForm";

export const metadata: Metadata = { title: "設定" };

export default async function SettingsPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: {
      id: true,
      displayName: true,
      name: true,
      email: true,
      prefecture: true,
      ageGroup: true,
      bio: true,
      yearsExp: true,
    },
  });

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-500 mt-1 text-sm">プロフィールを更新できます</p>
      </div>
      <SettingsForm user={user!} />
    </div>
  );
}
