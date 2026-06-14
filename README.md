# ホイクペディア管理アプリ

ホイクペディアの **候補者・園（企業）・選考状況** を 1 つの Web アプリで一元管理する社内ツール。

## 技術スタック

| 領域 | 採用技術 |
|---|---|
| フレームワーク | Next.js 15（App Router）/ TypeScript |
| DB・認証 | Supabase（PostgreSQL + Supabase Auth） |
| スタイル | Tailwind CSS v4 |
| デプロイ | Vercel |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクトの準備

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. SQL Editor で `supabase/schema.sql` を実行（テーブル + RLS を作成）
3. Authentication > Providers で **Email** を有効化
   （単独利用のため、必要なら "Confirm email" を無効化すると登録後すぐログインできる）

### 3. 環境変数

`.env.example` を `.env.local` にコピーして値を設定する。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` を開くと `/login` にリダイレクトされる。
初回はログイン画面の「新規作成」からアカウントを作成する。

## 画面構成

| ルート | 内容 |
|---|---|
| `/login` | Supabase Auth（メール + パスワード） |
| `/candidates` | 候補者一覧（ステータスでフィルタ）・詳細・追加・編集 |
| `/organizations` | 園・企業一覧（関係区分でフィルタ）・詳細・追加・編集 |
| `/placements` | 選考一覧（メイン画面）。候補者 × 園 × ステージを 1 行表示・詳細・追加・編集 |
| `/settings` | アカウント情報・連携設定（Google 連携は今後） |

## データモデル

`organizations`（園・企業）/ `candidates`（候補者）/ `placements`（選考＝候補者 × 園）の 3 テーブル。
詳細は `supabase/schema.sql` を参照。

## 実装状況

- [x] Phase 0 — スキーマ + Supabase Auth + ログイン画面
- [x] Phase 1 — `organizations` / `candidates` の CRUD
- [x] Phase 2 — `placements`（選考）の CRUD とメイン選考一覧
- [ ] Phase 3 — 既存 Sheets からの初回インポートスクリプト
- [ ] Phase 4 — アプリ → Sheets ミラー書き出し（ボタン + Cron）
- [ ] Phase 5 — ダッシュボード集計ほか
