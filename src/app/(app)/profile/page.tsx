import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/ui/ProfileForm";

export const metadata: Metadata = { title: "マイページ" };

export default async function ProfilePage() {
  const session = await auth();

  const [user, lineLinked, planCount, followCounts] = await Promise.all([
    db.user.findUnique({
      where: { id: session!.user.id },
      select: { id: true, name: true, email: true, avatarUrl: true, targetAge: true, bio: true },
    }),
    db.lineUser.findUnique({ where: { userId: session!.user.id } }),
    db.weeklyPlan.count({ where: { userId: session!.user.id } }),
    db.follow.count({ where: { followerId: session!.user.id } }),
  ]);

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "週案", value: planCount, unit: "件" },
          { label: "フォロー中", value: followCounts, unit: "人" },
          { label: "LINE連携", value: lineLinked ? "連携済み" : "未連携", unit: "" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {value}
              {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <ProfileForm user={user!} lineLinked={!!lineLinked} />
    </div>
  );
}
