import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Badge } from '@/components/ui';
import PlacementForm from '@/components/PlacementForm';
import DeleteButton from '@/components/DeleteButton';
import { updatePlacement, deletePlacement } from '../actions';
import type { Placement, Candidate, Organization } from '@/lib/types';

export const dynamic = 'force-dynamic';

type PlacementRow = Placement & {
  candidates: Pick<Candidate, 'id' | 'name'> | null;
  organizations: Pick<Organization, 'id' | 'name'> | null;
};

export default async function PlacementDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from('placements')
    .select('*, candidates(id, name), organizations(id, name)')
    .eq('id', id)
    .single();

  if (!row) notFound();
  const p = row as PlacementRow;

  if (edit) {
    const [{ data: candidates }, { data: organizations }] = await Promise.all([
      supabase.from('candidates').select('id, name').order('name'),
      supabase.from('organizations').select('id, name').order('name'),
    ]);
    const update = updatePlacement.bind(null, id);
    return (
      <div>
        <PageHeader title="選考を編集" />
        <PlacementForm
          action={update}
          placement={p}
          candidates={candidates ?? []}
          organizations={organizations ?? []}
          cancelHref={`/placements/${id}`}
        />
      </div>
    );
  }

  const deleteAction = deletePlacement.bind(null, id);

  return (
    <div>
      <PageHeader
        title={`${p.candidates?.name ?? '？'} × ${p.organizations?.name ?? '？'}`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/placements/${id}?edit=1`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              編集
            </Link>
            <DeleteButton action={deleteAction} confirmText="この選考を削除しますか？" />
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="候補者">
            {p.candidates ? (
              <Link
                href={`/candidates/${p.candidates.id}`}
                className="text-brand-700 hover:underline"
              >
                {p.candidates.name}
              </Link>
            ) : (
              '—'
            )}
          </Row>
          <Row label="園・企業">
            {p.organizations ? (
              <Link
                href={`/organizations/${p.organizations.id}`}
                className="text-brand-700 hover:underline"
              >
                {p.organizations.name}
              </Link>
            ) : (
              '—'
            )}
          </Row>
          <Row label="ステージ"><Badge value={p.stage} /></Row>
          <Row label="状況"><Badge value={p.stage_status} /></Row>
          <Row label="次の予定日">{p.next_date || '—'}</Row>
          <Row label="次にやること">{p.next_action || '—'}</Row>
          <Row label="メモ" full>
            {p.notes ? <span className="whitespace-pre-wrap">{p.notes}</span> : '—'}
          </Row>
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  );
}
