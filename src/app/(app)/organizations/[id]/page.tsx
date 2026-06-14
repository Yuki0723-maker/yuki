import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Badge } from '@/components/ui';
import OrganizationForm from '@/components/OrganizationForm';
import DeleteButton from '@/components/DeleteButton';
import { updateOrganization, deleteOrganization } from '../actions';
import type { Organization, Candidate, Placement } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (!org) notFound();
  const o = org as Organization;

  if (edit) {
    const update = updateOrganization.bind(null, id);
    return (
      <div>
        <PageHeader title={`${o.name} を編集`} />
        <OrganizationForm action={update} org={o} cancelHref={`/organizations/${id}`} />
      </div>
    );
  }

  // 関連する選考（候補者名付き）
  const { data: placementRows } = await supabase
    .from('placements')
    .select('*, candidates(name)')
    .eq('organization_id', id)
    .order('created_at', { ascending: false });

  const placements = (placementRows ?? []) as (Placement & {
    candidates: Pick<Candidate, 'name'> | null;
  })[];

  const deleteAction = deleteOrganization.bind(null, id);

  return (
    <div>
      <PageHeader
        title={o.name}
        action={
          <div className="flex gap-2">
            <Link
              href={`/organizations/${id}?edit=1`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              編集
            </Link>
            <DeleteButton action={deleteAction} confirmText="この園・企業を削除しますか？関連する選考も削除されます。" />
          </div>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Row label="関係区分"><Badge value={o.relation_type} /></Row>
          <Row label="所在">{[o.country, o.city].filter(Boolean).join(' / ') || '—'}</Row>
          <Row label="担当者">{o.contact_person || '—'}</Row>
          <Row label="担当者メール">{o.contact_email || '—'}</Row>
          <Row label="給与">{formatSalary(o)}</Row>
          <Row label="採用サイクル">{o.hiring_cycle || '—'}</Row>
          <Row label="メモ" full>
            {o.notes ? (
              <span className="whitespace-pre-wrap">{o.notes}</span>
            ) : (
              '—'
            )}
          </Row>
        </dl>
      </div>

      <h2 className="mt-8 mb-3 text-base font-bold text-slate-800">関連する選考</h2>
      {placements.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
          この園・企業に紐づく選考はありません。
        </p>
      ) : (
        <ul className="space-y-2">
          {placements.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium text-slate-800">
                {p.candidates?.name ?? '（候補者不明）'}
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

function formatSalary(o: Organization): string {
  if (o.salary_min == null && o.salary_max == null) return '—';
  const cur = o.salary_currency ?? '';
  const min = o.salary_min != null ? o.salary_min.toLocaleString() : '';
  const max = o.salary_max != null ? o.salary_max.toLocaleString() : '';
  if (min && max) return `${min}〜${max} ${cur}`;
  return `${min || max} ${cur}`;
}
