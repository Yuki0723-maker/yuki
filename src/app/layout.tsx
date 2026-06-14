import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ホイクペディア管理',
  description: '候補者・園・選考状況を一元管理する社内アプリ',
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
