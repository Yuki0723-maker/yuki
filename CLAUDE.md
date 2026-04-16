# HoikuNote — プロジェクト設計書

## 概要
保育士が週の様子をメモするだけでAIが指導計画を作成し、全国の保育士と知見を共有できるSaaSプラットフォーム。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router) + TypeScript |
| スタイリング | Tailwind CSS v4 |
| 認証 | NextAuth.js v5 (Google / メール) |
| ORM | Prisma + PostgreSQL |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| リアルタイム | Supabase Realtime (週案フィード) |
| ホスティング | Vercel |

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # ログイン画面
│   │   └── register/page.tsx       # 新規登録画面
│   ├── (dashboard)/
│   │   ├── layout.tsx              # サイドバー付きレイアウト
│   │   ├── dashboard/page.tsx      # ダッシュボード
│   │   ├── notes/
│   │   │   ├── new/page.tsx        # 週の様子入力
│   │   │   └── [id]/page.tsx       # 週案詳細・編集
│   │   ├── feed/page.tsx           # コミュニティフィード
│   │   └── settings/page.tsx       # 設定
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── notes/route.ts
│       ├── plans/
│       │   ├── route.ts
│       │   └── generate/route.ts   # Claude API呼び出し
│       └── posts/route.ts
├── components/
│   ├── auth/                        # 認証コンポーネント
│   ├── notes/                       # 週案入力関連
│   ├── plans/                       # 計画表示・編集
│   ├── feed/                        # コミュニティフィード
│   └── ui/                          # 汎用UIコンポーネント
└── lib/
    ├── auth.ts                      # NextAuth設定
    ├── db.ts                        # Prismaクライアント
    ├── claude.ts                    # Claude API + システムプロンプト
    └── utils.ts
prisma/
└── schema.prisma                    # DBスキーマ
```

## DBスキーマ概要

```
User ──< WeeklyNote ──1 Plan
     ──< Post ──< Like
              ──< SavedPost
```

- **User**: ユーザー（担当クラス・都道府県を保持）
- **WeeklyNote**: 週の様子メモ（AIへの入力）
- **Plan**: AI生成された指導計画（ねらい/内容/援助）
- **Post**: コミュニティ投稿（活動アイデア共有）

## 環境変数

```env
# 認証
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# DB
DATABASE_URL=postgresql://...

# AI
ANTHROPIC_API_KEY=...

# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## AIシステムプロンプト方針

Claude APIには以下を組み込む：
- 「保育所保育指針」「幼保連携型認定こども園教育・保育要領」の文言に準拠
- 子ども主体の保育観を反映した表現
- ねらい・内容・援助・環境構成の4軸で出力
- 年齢発達特性を考慮した内容

## フェーズ別実装計画

### Phase 1（MVP）
- [x] プロジェクト設計・CLAUDE.md
- [x] DBスキーマ設計
- [ ] 認証画面（ログイン・登録）
- [ ] 週の様子入力 → AI生成 → 保存
- [ ] 週案一覧・詳細

### Phase 2（コミュニティ）
- [ ] 週案フィード（Supabase Realtime）
- [ ] 活動アイデア投稿・いいね・保存
- [ ] 年齢別・テーマ別掲示板

### Phase 3（パーソナライズ）
- [ ] 担当クラス・年齢に合わせた活動提案
- [ ] 季節・行事との連動
- [ ] 成長記録との連動

## セキュリティ方針

- 子ども名・園名などの個人情報はフィード上で非表示
- 公開範囲を `PUBLIC / MEMBERS_ONLY / PRIVATE` の3段階で管理
- WeeklyNoteのraw textは本人のみ閲覧可能
- Claude APIへ送信する際に個人情報をマスキング処理する（Phase 2以降）

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # ビルド
npm run db:push      # DBスキーマ反映（開発用）
npm run db:migrate   # マイグレーション実行
npm run db:studio    # Prisma Studio起動
```
