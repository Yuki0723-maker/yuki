# ホイクペディア管理アプリ 要件仕様書

参考にした既存システム：Yuya 制作の「COS PEO管理」（Next.js + Supabase + Vercel）。

## 1. 目的

ホイクペディアの **候補者・園（企業）・選考状況** を 1 つの Web アプリで一元管理する。

- これまで Google（スプレッドシート）に蓄積してきた情報を初回に取り込む
- 今後の更新・管理は **アプリ側を主** とする
- Google スプレッドシートは **アプリから自動で書き出すミラー（バックアップ）** として残す（編集はしない）

## 2. 技術スタック

| 領域 | 採用技術 |
|---|---|
| フレームワーク | Next.js（App Router）/ TypeScript |
| DB・認証 | Supabase（PostgreSQL + Supabase Auth） |
| デプロイ | Vercel |
| スタイル | Tailwind CSS |
| Google 連携 | Google Sheets API（サービスアカウント） |

## 3. データモデル

3 つのテーブルで構成する。中心は「選考（placements）」＝候補者 × 園 の関係。

### organizations（園・企業）
id / name / relation_type（契約園・連携園・その他）/ country / city / contact_person /
contact_email / salary_min / salary_max / salary_currency / hiring_cycle / notes /
created_at / updated_at

### candidates（候補者）
id / name / status（面談前・選考中・内定・保留・見送り）/ hoikushi_exam_status /
desired_region / notes / created_at / updated_at

### placements（選考＝候補者 × 園）
id / candidate_id(FK) / organization_id(FK) / stage（書類・一次面接・二次面接・内定・見送り）/
stage_status（調整中・確定・完了）/ next_action / next_date / notes / created_at / updated_at

> 一覧では「由利栞様 × NoBorders × 一次面接（調整中）」のように 1 行で表示される。

### （Phase 2 候補）placement_logs
選考の履歴を残したくなったら `placement_id` + `date` + `memo` の履歴テーブルを追加する。MVP では不要。

## 4. Google 連携（B 方式：アプリ主・Google ミラー）

**方向は一方向（アプリ → Sheets）のみ。** 双方向同期はしない。

- 初回インポート：ローカル Node スクリプトで既存シートを読み Supabase へ挿入（一度きり）
- ミラー書き出し：アプリ内ボタン + Vercel Cron で各テーブルを Sheet タブへ上書き
- 認証：Google サービスアカウント。発行・共有設定は Yuki 本人が実施
- 環境変数：`GOOGLE_SERVICE_ACCOUNT_JSON`、`TARGET_SHEET_ID`

## 5. 画面構成（MVP）

| ルート | 内容 |
|---|---|
| `/login` | Supabase Auth（メール + パスワード）。当面 Yuki 単独利用 |
| `/candidates` | 候補者一覧（ステータスでフィルタ） |
| `/candidates/[id]` | 候補者詳細・編集・関連する選考表示 |
| `/organizations` | 園・企業一覧（契約園 / 連携園でフィルタ） |
| `/organizations/[id]` | 園詳細・編集 |
| `/placements` | **メイン画面**：選考一覧。誰 × どこ × どの段階かを 1 行表示 |
| `/dashboard`（任意） | 件数サマリ。後回しでよい |

ナビゲーションは上部タブで `候補者 / 園 / 選考 / 設定`。

## 6. 実装順（フェーズ）

1. **Phase 0** — Supabase プロジェクト、3 テーブル + Auth、Vercel デプロイ疎通
2. **Phase 1** — organizations と candidates の CRUD
3. **Phase 2** — placements の CRUD とメイン選考一覧画面
4. **Phase 3** — 既存 Sheets からの初回インポートスクリプト
5. **Phase 4** — アプリ → Sheets ミラー書き出し（ボタン + Cron）
6. **Phase 5（後回し）** — ダッシュボード集計、請求・紹介元配分

## 7. 着手前に確定すること

- [ ] 既存スプレッドシートの実際の列名を確認し、本仕様のフィールドと突き合わせて調整
- [ ] 選考ステージの実際の呼び方を確定（書類 → 一次 → 二次 → 内定 でよいか）
- [ ] 日程を JST 基準で持つか、BC / JST 両方を持つか決める
- [ ] Google サービスアカウントの発行と対象 Sheet の共有
