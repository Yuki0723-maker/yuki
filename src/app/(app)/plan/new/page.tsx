import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatPlanFlow } from "@/components/plan/ChatPlanFlow";

export const metadata: Metadata = { title: "週案を作る" };

export default async function PlanNewPage() {
  const session = await auth();

  const [templates, user] = await Promise.all([
    db.planTemplate.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: session!.user.id },
      select: { targetAge: true, classSize: true, teachingStyle: true, childrenNote: true },
    }),
  ]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#3d2b1f]">週案を作る</h1>
        <p className="text-sm text-[#b09070] mt-1">
          AIと対話しながら、あなたのクラスに合った週案を作成します
        </p>
      </div>
      <ChatPlanFlow
        templates={templates}
        classProfile={{
          classAge: user?.targetAge ?? null,
          classSize: user?.classSize ?? null,
          teachingStyle: user?.teachingStyle ?? null,
          childrenNote: user?.childrenNote ?? null,
        }}
      />
    </div>
  );
}
