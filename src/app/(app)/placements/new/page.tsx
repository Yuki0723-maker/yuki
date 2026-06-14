import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui';
import PlacementForm from '@/components/PlacementForm';
import { createPlacement } from '../actions';

export const dynamic = 'force-dynamic';

export default async function NewPlacementPage() {
  const supabase = await createClient();
  const [{ data: candidates }, { data: organizations }] = await Promise.all([
    supabase.from('candidates').select('id, name').order('name'),
    supabase.from('organizations').select('id, name').order('name'),
  ]);

  const cand = candidates ?? [];
  const orgs = organizations ?? [];

  if (cand.length === 0 || orgs.length === 0) {
    return (
      <div>
        <PageHeader title="選考を追加" />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          選考を作るには、候補者と園・企業が少なくとも 1 件ずつ必要です。
          <div className="mt-3 flex gap-3">
            {cand.length === 0 && (
              <Link href="/candidates/new" className="font-medium underline">
                候補者を追加
              </Link>
            )}
            {orgs.length === 0 && (
              <Link href="/organizations/new" className="font-medium underline">
                園・企業を追加
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="選考を追加" />
      <PlacementForm
        action={createPlacement}
        candidates={cand}
        organizations={orgs}
        cancelHref="/placements"
      />
    </div>
  );
}
