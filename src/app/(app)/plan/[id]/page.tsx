import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PlanDetail } from "@/components/plan/PlanDetail";

export const metadata: Metadata = { title: "週案詳細" };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const plan = await db.weeklyPlan.findUnique({
    where: { id, userId: session!.user.id },
  });

  if (!plan) notFound();

  const templates = await db.planTemplate.findMany({
    where: { userId: session!.user.id },
    select: { id: true, name: true },
  });

  return <div className="p-6"><PlanDetail plan={plan} templates={templates} /></div>;
}
