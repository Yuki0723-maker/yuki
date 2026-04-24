import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FormatWizard } from "@/components/onboarding/FormatWizard";
import { FACILITY_LABELS, LAYOUT_OPTIONS } from "@/lib/format-definitions";
import type { FacilityType, LayoutType, FieldSlug, FieldLayoutItem } from "@/lib/format-definitions";

export const metadata: Metadata = { title: "フォーマット設定 | ことのは" };

export default async function FormatSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const config = await db.userFormatConfig.findUnique({
    where: { userId: session.user.id },
  });
  if (!config) redirect("/onboarding");

  const facilityLabel = FACILITY_LABELS[config.facilityType as FacilityType] ?? config.facilityType;
  const layoutLabel = LAYOUT_OPTIONS.find(o => o.value === config.layoutType)?.label ?? config.layoutType;
  const contentFieldCount = (config.activeFields as string[]).filter(
    f => !["class_name","week_date","teacher_name","enrollment_count","month_plan_week"].includes(f)
  ).length;

  const initialConfig = {
    facilityType: config.facilityType as FacilityType,
    layoutType: config.layoutType as LayoutType,
    activeFields: config.activeFields as FieldSlug[],
    fieldLayout: (config.fieldLayout ?? []) as FieldLayoutItem[],
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#FDF5E6" }}>
      {/* Blob decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full" style={{ background: "rgba(255,183,178,0.1)", filter: "blur(56px)" }}/>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full" style={{ background: "rgba(178,226,242,0.1)", filter: "blur(64px)" }}/>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif-jp font-bold mb-1" style={{ fontSize: "20px", color: "#4A4A4A", letterSpacing: "0.06em" }}>
            フォーマット設定
          </h1>
          <p className="text-sm" style={{ color: "#B0A090" }}>週案のフォーマットをいつでも変更できます</p>
        </div>

        {/* Current config summary */}
        <div
          className="glass rounded-2xl p-5 mb-6 flex flex-wrap gap-3"
          style={{ border: "1px solid rgba(255,255,255,0.88)" }}
        >
          <SummaryBadge label="施設タイプ" value={facilityLabel} color="#FFB7B2" />
          <SummaryBadge label="レイアウト" value={layoutLabel} color="#B2E2F2" />
          <SummaryBadge label="項目数" value={`${contentFieldCount}項目`} color="#D1E8E2" />
        </div>

        {/* Wizard in settings mode */}
        <div className="glass rounded-3xl p-7">
          <FormatWizard mode="settings" initialConfig={initialConfig} />
        </div>
      </div>
    </div>
  );
}

function SummaryBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex flex-col rounded-xl px-4 py-2.5 flex-1 min-w-[120px]"
      style={{ background: `${color}18`, border: `1px solid ${color}50` }}
    >
      <span className="text-xs" style={{ color: "#B4A494" }}>{label}</span>
      <span className="text-sm font-medium mt-0.5" style={{ color: "#4A4A4A" }}>{value}</span>
    </div>
  );
}
