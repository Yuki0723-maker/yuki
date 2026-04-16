import type { AgeGroup } from "@prisma/client";

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  AGE_0: "0歳児",
  AGE_1: "1歳児",
  AGE_2: "2歳児",
  AGE_3: "3歳児",
  AGE_4: "4歳児",
  AGE_5: "5歳児",
  MIXED: "縦割り",
};

export const SEASON_LABELS: Record<string, string> = {
  spring: "春（3〜5月）",
  summer: "夏（6〜8月）",
  autumn: "秋（9〜11月）",
  winter: "冬（12〜2月）",
};

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(weekStart: Date): string {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 〜 ${end.getMonth() + 1}月${end.getDate()}日`;
}

export function getSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
