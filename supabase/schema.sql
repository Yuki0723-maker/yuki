-- =============================================================
-- ホイクペディア管理アプリ  Supabase スキーマ
-- 実行方法: Supabase ダッシュボード > SQL Editor に貼り付けて実行
-- =============================================================

-- 拡張: uuid 生成（Supabase では既定で有効なことが多いが念のため）
create extension if not exists "pgcrypto";

-- updated_at 自動更新トリガ関数 -------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- organizations（園・企業）
-- =============================================================
create table if not exists public.organizations (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  relation_type   text not null default 'その他'  -- 契約園 / 連携園 / その他
                    check (relation_type in ('契約園', '連携園', 'その他')),
  country         text,
  city            text,
  contact_person  text,
  contact_email   text,
  salary_min      numeric,
  salary_max      numeric,
  salary_currency text default 'JPY',
  hiring_cycle    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- =============================================================
-- candidates（候補者）
-- =============================================================
create table if not exists public.candidates (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  status               text not null default '面談前'  -- 面談前 / 選考中 / 内定 / 保留 / 見送り
                         check (status in ('面談前', '選考中', '内定', '保留', '見送り')),
  hoikushi_exam_status text,
  desired_region       text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

drop trigger if exists trg_candidates_updated_at on public.candidates;
create trigger trg_candidates_updated_at
  before update on public.candidates
  for each row execute function public.set_updated_at();

-- =============================================================
-- placements（選考＝候補者 × 園） ※Phase 2 で画面実装
-- =============================================================
create table if not exists public.placements (
  id              uuid primary key default gen_random_uuid(),
  candidate_id    uuid not null references public.candidates(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  stage           text not null default '書類'  -- 書類 / 一次面接 / 二次面接 / 内定 / 見送り
                    check (stage in ('書類', '一次面接', '二次面接', '内定', '見送り')),
  stage_status    text not null default '調整中'  -- 調整中 / 確定 / 完了
                    check (stage_status in ('調整中', '確定', '完了')),
  next_action     text,
  next_date       date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_placements_updated_at on public.placements;
create trigger trg_placements_updated_at
  before update on public.placements
  for each row execute function public.set_updated_at();

create index if not exists idx_placements_candidate on public.placements(candidate_id);
create index if not exists idx_placements_organization on public.placements(organization_id);

-- =============================================================
-- Row Level Security
-- 当面は Yuki 単独利用。ログイン済み（authenticated）ユーザーに
-- 全レコードへのフルアクセスを許可する。
-- =============================================================
alter table public.organizations enable row level security;
alter table public.candidates    enable row level security;
alter table public.placements    enable row level security;

drop policy if exists "authenticated full access" on public.organizations;
create policy "authenticated full access" on public.organizations
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.candidates;
create policy "authenticated full access" on public.candidates
  for all to authenticated using (true) with check (true);

drop policy if exists "authenticated full access" on public.placements;
create policy "authenticated full access" on public.placements
  for all to authenticated using (true) with check (true);
