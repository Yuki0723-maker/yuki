"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import type { FacilityType, LayoutType, FieldSlug } from "@/lib/format-definitions"

export async function saveFormatConfig(data: {
  facilityType: FacilityType
  layoutType: LayoutType
  activeFields: FieldSlug[]
}) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const targetAge = data.facilityType === "nursery_infant" ? 1 : 4

  await db.userFormatConfig.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: { ...data },
  })

  await db.user.update({
    where: { id: session.user.id },
    data: { targetAge },
  })

  redirect("/plans")
}

export async function getFormatConfig() {
  const session = await auth()
  if (!session) return null

  return db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  })
}
