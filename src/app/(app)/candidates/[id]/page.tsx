import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Badge } from '@/components/ui';
import CandidateForm from '@/components/CandidateForm';
import DeleteButton from '@/components/DeleteButton';
import { updateCandidate, deleteCandidate } from '../actions';
import type { Candidate, Organization, Placement } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CandidateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (!candidate) notFound();
  const c = candidate as Candidate;

  if (edit) {
    const update = updateCandidate.bind(null, id);
    return (
      <div>
        <PageHeader title={`${c.name} を編集`} />
        <CandidateForm action={update} candidate={c} cancelHref={`/candidates/${id}`} />
      </div>
    );
  }

  // 関連する選考（園名付き）
  const { data: placementRows } = await supabase
    .from('placements')
    .select('*, organizations(name)')
    .eq('candidate_id', id)
    .order('created_at', { ascending: false });

  const placements = (placementRows ?? []) as (Placement & {
    organizations: Pick<Organization, 'name'> | null;
  })[];

  const deleteAction = deleteCandidate.bind(null, id);

  return (
    <div>
      <PageHeader
        title={c.name}
        action={
          <div className="flex gap-2">
            <Link
              href={`/candidates/${id}?edit=1`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              編集
            </Link>
            <DeleteButton action={deleteAction} confirmText="この候補者を削除しますか？関連する選考も削除されます。" />
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="ステータス"><Badge value={c.status} /></Row>
          <Row label="希望勤務地">{c.desired_region || '—'}</Row>
          <Row label="保育士試験の状況" full>{c.hoikushi_exam_status || '—'}</Row>
          <Row label="メモ" full>
            {c.notes ? <span className="whitespace-pre-wrap">{c.notes}</span> : '—'}
          </Row>
        </dl>
      </div>

      <h2 className="mt-8 mb-3 text-base font-bold text-slate-800">関連する選考</h2>
      {placements.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
          この候補者に紐づく選考はありません。
        </p>
      ) : (
        <ul className="space-y-2">
          {placements.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-800">
                {p.organizations?.name ?? '（園不明）'}
              </span>
              <span className="flex items-center gap-2">
                <Badge value={p.stage} />
                <Badge value={p.stage_status} />
              </span>
            </li>
          ))}
        </ul>
      )}
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
