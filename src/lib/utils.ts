export function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(weekStart: Date | string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 4);
  const fmt = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(start)} 〜 ${end.getMonth() + 1}月${end.getDate()}日`;
}

export const AGE_LABELS: Record<number, string> = {
  0: "0歳児",
  1: "1歳児",
  2: "2歳児",
  3: "3歳児",
  4: "4歳児",
  5: "5歳児",
};

export const SEASON_LABELS: Record<string, string> = {
  spring: "春（3〜5月）",
  summer: "夏（6〜8月）",
  autumn: "秋（9〜11月）",
  winter: "冬（12〜2月）",
};

export function getSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
