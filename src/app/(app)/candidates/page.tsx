import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, PrimaryLink, Badge, EmptyState } from '@/components/ui';
import { CANDIDATE_STATUSES, type Candidate } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && CANDIDATE_STATUSES.includes(status as never)) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  const candidates = (data ?? []) as Candidate[];

  return (
    <div>
      <PageHeader
        title="候補者"
        action={<PrimaryLink href="/candidates/new">＋ 新規追加</PrimaryLink>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip label="すべて" href="/candidates" active={!status} />
        {CANDIDATE_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={s}
            href={`/candidates?status=${encodeURIComponent(s)}`}
            active={status === s}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          読み込みエラー: {error.message}
        </p>
      )}

      {candidates.length === 0 ? (
        <EmptyState message="候補者がまだ登録されていません。" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">氏名</th>
                <th className="px-4 py-3 font-medium">ステータス</th>
                <th className="px-4 py-3 font-medium">希望勤務地</th>
                <th className="px-4 py-3 font-medium">保育士試験</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/candidates/${c.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={c.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.desired_region || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.hoikushi_exam_status || '—'}
                  </td>
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
