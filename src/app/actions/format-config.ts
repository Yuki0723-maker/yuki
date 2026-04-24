"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import type { FacilityType, LayoutType, FieldSlug, FieldLayoutItem } from "@/lib/format-definitions"

interface FormatConfigData {
  facilityType: FacilityType
  layoutType: LayoutType
  activeFields: FieldSlug[]
  fieldLayout?: FieldLayoutItem[]
}

export async function saveFormatConfig(data: FormatConfigData) {
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

export async function updateFormatConfig(data: FormatConfigData) {
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
}

export async function getFormatConfig() {
  const session = await auth()
  if (!session) return null

  return db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  })
}
