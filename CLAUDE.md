# ホイクペディア管理アプリ — プロジェクト設計書

## 概要
ホイクペディアの **候補者・園（企業）・選考状況** を 1 つの Web アプリで一元管理する社内ツール。
今後の更新・管理はアプリ側を主とし、Google スプレッドシートはアプリから書き出すミラー（バックアップ）として残す（Phase 4 で実装）。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) + TypeScript |
| DB・認証 | Supabase (PostgreSQL + Supabase Auth) |
| スタイリング | Tailwind CSS v4 |
| ホスティング | Vercel |
| Google 連携 | Google Sheets API（サービスアカウント / Phase 4） |

## ディレクトリ構成

```
src/
├── app/
│   ├── login/page.tsx              # ログイン（Supabase Auth）
│   ├── (app)/                      # 認証必須レイアウト（上部ナビ付き）
│   │   ├── layout.tsx
│   │   ├── candidates/             # 候補者 一覧・新規・詳細/編集 + actions.ts
│   │   ├── organizations/          # 園・企業 一覧・新規・詳細/編集 + actions.ts
│   │   ├── placements/             # 選考（メイン）一覧・新規・詳細/編集 + actions.ts
│   │   └── settings/page.tsx
│   ├── layout.tsx                  # ルート
│   ├── page.tsx                    # /placements へリダイレクト
│   └── globals.css
├── components/                     # NavBar / 各フォーム / ui.tsx / DeleteButton
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   └── types.ts
└── middleware.ts                   # 認証ガード・セッション更新
supabase/
└── schema.sql                      # テーブル + RLS（SQL Editor で実行）
```

## データモデル

3 テーブル。中心は「選考（placements）」＝候補者 × 園 の関係。

- **organizations**: 園・企業（relation_type: 契約園/連携園/その他）
- **candidates**: 候補者（status: 面談前/選考中/内定/保留/見送り）
- **placements**: 選考（stage: 書類/一次面接/二次面接/内定/見送り、stage_status: 調整中/確定/完了）

カラム定義の正は `supabase/schema.sql`、TypeScript 型は `src/lib/types.ts`。

## 認証・セキュリティ
- Supabase Auth（メール + パスワード）。当面 Yuki 単独利用。
- `middleware.ts` が未ログインを `/login` にリダイレクト。
- RLS は authenticated ユーザーに全レコードへのフルアクセスを許可。

## 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Phase 4: GOOGLE_SERVICE_ACCOUNT_JSON / TARGET_SHEET_ID
```

## 実装フェーズ
- [x] Phase 0 — スキーマ + Auth + ログイン
- [x] Phase 1 — organizations / candidates CRUD
- [x] Phase 2 — placements CRUD・メイン一覧
- [ ] Phase 3 — Sheets からの初回インポートスクリプト
- [ ] Phase 4 — アプリ → Sheets ミラー書き出し（ボタン + Cron）
- [ ] Phase 5 — ダッシュボード集計ほか

## 開発コマンド
```bash
npm run dev    # 開発サーバー
npm run build  # ビルド
npm run lint   # Lint
```
