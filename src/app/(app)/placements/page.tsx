import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, PrimaryLink, Badge, EmptyState } from '@/components/ui';
import {
  PLACEMENT_STAGES,
  type Placement,
  type Candidate,
  type Organization,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

type PlacementRow = Placement & {
  candidates: Pick<Candidate, 'name'> | null;
  organizations: Pick<Organization, 'name'> | null;
};

export default async function PlacementsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('placements')
    .select('*, candidates(name), organizations(name)')
    .order('next_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (stage && PLACEMENT_STAGES.includes(stage as never)) {
    query = query.eq('stage', stage);
  }

  const { data, error } = await query;
  const placements = (data ?? []) as PlacementRow[];

  return (
    <div>
      <PageHeader
        title="選考"
        action={<PrimaryLink href="/placements/new">＋ 新規追加</PrimaryLink>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip label="すべて" href="/placements" active={!stage} />
        {PLACEMENT_STAGES.map((s) => (
          <FilterChip
            key={s}
            label={s}
            href={`/placements?stage=${encodeURIComponent(s)}`}
            active={stage === s}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {placements.length === 0 ? (
        <EmptyState message="選考がまだ登録されていません。候補者と園を登録してから追加してください。" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">候補者 × 園</th>
                <th className="px-4 py-3 font-medium">ステージ</th>
                <th className="px-4 py-3 font-medium">状況</th>
                <th className="px-4 py-3 font-medium">次の予定</th>
                <th className="px-4 py-3 font-medium">次にやること</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/placements/${p.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {p.candidates?.name ?? '？'} × {p.organizations?.name ?? '？'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={p.stage} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={p.stage_status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.next_date || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.next_action || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? 'border-brand-600 bg-brand-50 text-brand-700'
          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
