import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HoikuNote",
    template: "%s | HoikuNote",
  },
  description:
    "保育士が週の様子をメモするだけでAIが指導計画を作成。全国の保育士と知見を共有できるプラットフォーム。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
