import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, PrimaryLink, Badge, EmptyState } from '@/components/ui';
import { RELATION_TYPES, type Organization } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ relation?: string }>;
}) {
  const { relation } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (relation && RELATION_TYPES.includes(relation as never)) {
    query = query.eq('relation_type', relation);
  }

  const { data, error } = await query;
  const orgs = (data ?? []) as Organization[];

  return (
    <div>
      <PageHeader
        title="園・企業"
        action={<PrimaryLink href="/organizations/new">＋ 新規追加</PrimaryLink>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip label="すべて" href="/organizations" active={!relation} />
        {RELATION_TYPES.map((r) => (
          <FilterChip
            key={r}
            label={r}
            href={`/organizations?relation=${encodeURIComponent(r)}`}
            active={relation === r}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {orgs.length === 0 ? (
        <EmptyState message="園・企業がまだ登録されていません。" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">名称</th>
                <th className="px-4 py-3 font-medium">区分</th>
                <th className="px-4 py-3 font-medium">所在</th>
                <th className="px-4 py-3 font-medium">担当者</th>
                <th className="px-4 py-3 font-medium">給与</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/organizations/${o.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={o.relation_type} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {[o.country, o.city].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.contact_person || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatSalary(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
