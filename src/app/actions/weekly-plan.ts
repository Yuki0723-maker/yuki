"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWeekStart } from "@/lib/utils"

export async function createWeeklyPlan() {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const config = await db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  })

  const targetAge = config?.facilityType === "nursery_infant" ? 1 : 4

  return db.weeklyPlan.create({
    data: {
      userId: session.user.id,
      weekStartDate: getWeekStart(),
      targetAge,
      rawMemo: "",
      goal: "",
      content: "",
      environment: "",
      support: "",
      guidelineRef: "",
      fields: {},
      isDraft: true,
    },
  })
}

export async function updateWeeklyPlanFields(planId: string, fields: Record<string, string>) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  return db.weeklyPlan.update({
    where: { id: planId, userId: session.user.id },
    data: { fields },
  })
}

export async function finalizePlan(planId: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  return db.weeklyPlan.update({
    where: { id: planId, userId: session.user.id },
    data: { isDraft: false },
  })
}
