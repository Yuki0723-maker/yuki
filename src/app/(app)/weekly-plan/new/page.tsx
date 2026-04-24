import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getWeekStart } from "@/lib/utils";
import { WeeklyPlanEditor } from "@/components/plan/WeeklyPlanEditor";
import type { FieldSlug } from "@/lib/format-definitions";

export default async function WeeklyPlanNewPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const config = await db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  });
  if (!config) redirect("/onboarding");

  const plan = await db.weeklyPlan.create({
    data: {
      userId: session.user.id,
      weekStartDate: getWeekStart(),
      targetAge: config.facilityType === "nursery_infant" ? 1 : 4,
      rawMemo: "",
      goal: "",
      content: "",
      environment: "",
      support: "",
      guidelineRef: "",
      fields: {},
      isDraft: true,
    },
  });

  return (
    <WeeklyPlanEditor
      planId={plan.id}
      activeFields={config.activeFields as FieldSlug[]}
    />
  );
}
